import jwt from "jsonwebtoken";
import { startSession } from "mongoose";

import { config } from "../../config/index.js";
import { SessionEntity } from "../../data/entities/session.entity.js";
import { TokenEntity } from "../../data/entities/token.entity.js";
import {
  SessionRepository,
  TenantRepository,
  TokenRepository,
  UserRepository,
} from "../../data/repositories/index.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../utils/errors/index.js";
import { logger, messages } from "../../utils/index.js";
import { JwtService } from "./jwt.service.js";
import { MailService } from "./mail.service.js";
import { TokenService } from "./token.service.js";

export class AuthService {
  static async register(registerDto) {
    const session = await startSession();
    session.startTransaction();

    try {
      const [user, tenant] = await Promise.all([
        UserRepository.insert(
          { role: "admin", resetPassword: false, ...registerDto },
          session,
        ),
        TenantRepository.insert(registerDto, session),
      ]);

      const ttl = 10; // in minutes
      const newToken = TokenEntity.make({
        userId: user._id,
        type: "verify",
        ttl,
      });
      await TokenService.insert(newToken, session);

      await MailService.send({
        to: registerDto.email,
        templateName: "new-tenant-user",
        context: {
          name: registerDto.firstName,
          otp: newToken.value,
          expiresIn: ttl,
        },
      });

      await session.commitTransaction();

      return {
        message: "You have successfully signed up for the service.",
        data: {
          id: tenant._id,
          nextSteps: [
            "Check email for an OTP to verify your account.",
            "Log in and explore the features.",
            "Customize your profile, manage your settings, and access our support.",
          ],
          verificationUrl: `${config.api.base_url}/auth/verify?email=${user.email}`,
        },
      };
    } catch (exception) {
      await session.abortTransaction();
      throw exception;
    } finally {
      await session.endSession();
    }
  }

  static async verify(email, otp) {
    const foundUser = await UserRepository.findByEmail(email);
    // const isMatch = foundUser?.validatePassword(password);
    if (!foundUser) {
      throw new NotFoundError("User account not found");
    } else if (foundUser.isEmailVerified) {
      throw new ConflictError("Account already verified, please sign in.");
    }

    const { isValid, reason } = await TokenService.findByTokenAndValidate(otp);
    if (!isValid) throw new ValidationError(reason);

    foundUser.set({
      isEmailVerified: true,
      active: true,
    });

    await Promise.all([
      foundUser.save(),
      TokenService.deleteOne({ userId: foundUser._id, type: "register" }),
    ]);

    return {
      message: "Verification Successful",
    };

    // const accessToken = JwtService.genAccessToken({ id: foundUser._id });
    // const refreshToken = JwtService.genRefreshToken({ id: foundUser._id });

    // await SessionService.create({ refreshToken, agent, ip });

    // mailer({
    //   to: foundUser.email,
    //   subject: 'Welcome to AIdea!',
    //   name: foundUser.first_name,
    //   template: 'new-tenant'
    // })

    // return { accessToken, refreshToken, user: foundUser.purgeSensitiveData() };
  }

  static async login({ email, password }, token, agent, ip) {
    const foundUser = await UserRepository.findByEmail(email);
    const isMatch = foundUser?.validatePassword(password);
    if (!foundUser || !isMatch) {
      throw new UnauthorizedError("Invalid Credentials");
    }

    const { isPermitted, data } = foundUser.permitLogin();
    if (!isPermitted) {
      throw new ForbiddenError(messages.AUTH.LOGIN.FAILED, data);
    }

    const accessToken = JwtService.generateAccessToken({ id: foundUser._id });
    const refreshToken = JwtService.generateRefreshToken({
      id: foundUser._id,
    });

    const newSession = SessionEntity.make({
      userId: foundUser._id,
      agent,
      ip,
      refreshToken,
    });

    const session = await SessionRepository.findOne({
      userId: foundUser._id,
    });

    if (session) {
      if (session.sessions.length > 0) {
        // ! Prune user sessions for expired refresh tokens.
        session.sessions = token
          ? session.sessions.filter(
              (s) => token !== s.refreshToken && Date.now() < s.expiresIn,
            )
          : session.sessions.filter((s) => Date.now() < s.expiresIn);

        if (session.sessions.length >= 3) {
          throw new ConflictError("Maximum allowed devices reached");
        }

        session.sessions.push(newSession.sessions[0]);
      } else {
        session.sessions = newSession.sessions;
      }

      await session.save();
    } else {
      await SessionRepository.insert(newSession);
    }

    await foundUser.updateOne({ "configurations.lastLoginTime": new Date() });

    MailService.send({
      to: email,
      templateName: "new-loginn",
      context: { name: foundUser.firstName, loginTime: new Date(), ip, agent },
    });

    return {
      message: "Login Successful",
      data: {
        accessToken,
        user: foundUser.purgeSensitiveData(),
        redirect: null,
      },
      refreshToken,
    };
  }

  static async logout(token) {
    if (!token) {
      throw new ValidationError("No token provided");
    }

    const session = await SessionRepository.findByToken(token);
    if (session) {
      session.sessions = session.sessions.filter(
        (s) => token !== s.refreshToken && Date.now() < s.expiresIn,
      );

      await session.save();
    }

    return {
      message: messages.AUTH.LOGOUT.SUCCESS,
    };
  }

  static async logOutAllSessions(token) {
    if (!token) {
      throw new ValidationError("No token provided");
    }

    const session = await SessionRepository.findByToken(token);

    if (session) {
      session.sessions = session.sessions.filter(
        (s) => token === s.refreshToken,
      );

      await session.save();
    }

    return {
      message: "Logged out all sessions",
    };
  }

  static async genTokenSet(token, agent, ip) {
    try {
      if (!token) {
        throw new ValidationError("No token provided");
      }

      const { issuer, secret } = config.jwt;
      const decoded = jwt.verify(token, secret.refresh, { issuer });

      const session = await SessionRepository.findByToken(token);
      if (!session) {
        logger.warn("Attempted refresh token reuse detected.");
        await SessionRepository.updateOne(decoded.id, { sessions: [] });
        throw new ForbiddenError("Forbidden");
      } else if (decoded.id !== session.userId.toString()) {
        throw new ForbiddenError("Invalid Token");
      }

      // ! Prune user sessions for expired refresh tokens.
      session.sessions = session.sessions.filter(
        (s) => token !== s.refreshToken && Date.now() < s.expiresIn,
      );

      const accessToken = JwtService.generateAccessToken({
        id: session.userId,
      });
      const refreshToken = JwtService.generateRefreshToken({
        id: session.userId,
      });

      const newSession = SessionEntity.make({
        userId: session.userId,
        agent,
        ip,
        refreshToken,
      });
      session.sessions.push(newSession.sessions[0]);

      await session.save();

      return {
        message: messages.AUTH.TOKENS.GEN_SUCCESS,
        data: { accessToken, refreshToken },
      };
    } catch (exception) {
      if (exception instanceof jwt.JsonWebTokenError) {
        throw new ForbiddenError(exception.message);
      }
      throw exception;
    }
  }

  static async requestToken({ email, type }) {
    const session = await startSession();
    session.startTransaction();

    try {
      const foundUser = await UserRepository.findByEmail(email);
      if (!foundUser) {
        throw new NotFoundError("User not found");
      }

      const ttl = 10; // in minutes;
      const newToken = TokenEntity.make({
        userId: foundUser._id,
        type,
        ttl,
      });
      await TokenRepository.upsert(newToken, session);

      await MailService.send({
        to: email,
        templateName: "otp-request",
        context: { otp: newToken.value, expiresIn: ttl },
      });

      await session.commitTransaction();

      return {
        message: messages.AUTH.TOKENS.REQ_SUCCESS,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}

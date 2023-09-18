import bcrypt from "bcryptjs";
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
  DependencyError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../utils/errors/index.js";
import {
  TOKEN_TYPES,
  USER_ROLES,
  USER_STATUS,
} from "../../utils/helpers/index.js";
import { logger, messages } from "../../utils/index.js";
import { JwtService } from "./jwt.service.js";
import { MailService } from "./mail.service.js";
import { TokenService } from "./token.service.js";

export class AuthService {
  static async register(registerDto) {
    const session = await startSession();
    session.startTransaction();

    try {
      // TODO: what to do about roles and tenants??
      const tenant = await TenantRepository.insert(registerDto, session);
      const user = await UserRepository.insert(
        {
          tenantId: tenant._id,
          role: "643865bf755e0170d0b3be87",
          resetPassword: false,
          ...registerDto,
        },
        session,
      );

      const ttl = 10; // in minutes
      const newToken = TokenEntity.make({
        userId: user._id,
        type: TOKEN_TYPES.VERIFY,
        ttl,
      });
      await TokenRepository.insert(newToken, session);

      const { error } = await MailService.send({
        to: registerDto.email,
        templateName: "new-tenant-user",
        context: {
          name: registerDto.firstName,
          otp: newToken.value,
          expiresIn: ttl,
        },
      });
      if (error) {
        throw new DependencyError("Registration Failed. Error sending OTP");
      }

      await session.commitTransaction();

      return {
        message: messages.AUTH.REGISTRATION.SUCCESS,
        data: {
          id: tenant._id,
          nextSteps: [
            "Check email for an OTP to verify your account.",
            "Log in and explore the features.",
            "Customize your profile, manage your settings, and access our support.",
          ],
          verificationUrl: `${config.api.base_url}/auth/verify-registration`,
        },
      };
    } catch (exception) {
      await session.abortTransaction();
      throw exception;
    } finally {
      await session.endSession();
    }
  }

  static async verifyRegistration({ email, token }) {
    const foundUser = await UserRepository.findByEmail(email);
    if (!foundUser) {
      throw new NotFoundError("User account not found");
    } else if (foundUser.isEmailVerified) {
      throw new ConflictError(messages.AUTH.VERIFY.CONFLICT);
    } else if (foundUser.isSuspended) {
      throw new ForbiddenError(messages.AUTH.LOGIN.ACCOUNT_DEACTIVATED);
    }

    const { isValid, reason } = await TokenService.findByTokenAndValidate(
      token,
      TOKEN_TYPES.VERIFY,
    );
    if (!isValid) throw new ValidationError(reason);

    foundUser.set({
      isEmailVerified: true,
      status: USER_STATUS.ACTIVE,
    });

    await Promise.all([
      foundUser.save(),
      TokenService.deleteOne({
        userId: foundUser._id,
        type: TOKEN_TYPES.VERIFY,
      }),
    ]);

    // MailService.send({
    //   to: foundUser.email,
    //   subject: 'Welcome to AIdea!',
    //   name: foundUser.first_name,
    //   template: 'new-tenant'
    // })

    return {
      message: messages.AUTH.VERIFY.SUCCESS,
    };
  }

  static async login(user, password, token, agent, ip) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid Credentials");
    }

    const accessToken = JwtService.generateAccessToken({ id: user._id });
    const refreshToken = JwtService.generateRefreshToken({
      id: user._id,
    });

    const newSession = SessionEntity.make({
      userId: user._id,
      agent,
      ip,
      refreshToken,
    });

    const session = await SessionRepository.findOne({
      userId: user._id,
    });

    if (session) {
      // ! Prune user sessions for expired refresh tokens.
      session.sessions = token
        ? session.sessions.filter(
            (s) => token !== s.refreshToken && Date.now() < s.expiresIn,
          )
        : session.sessions.filter((s) => Date.now() < s.expiresIn);

      if (session.sessions.length >= 3) {
        throw new ConflictError("Maximum allowed devices reached");
      }

      session.sessions = [newSession.sessions[0], ...session.sessions];
      await session.save();
    } else {
      await SessionRepository.insert(newSession);
    }

    UserRepository.updateById(user.id, {
      "configurations.lastLoginTime": new Date(),
    });

    MailService.send({
      to: user.email,
      // TODO: fix this
      templateName: "new-loginn",
      context: { name: user.firstName, loginTime: new Date(), ip, agent },
    });

    return {
      message: messages.AUTH.LOGIN.SUCCESS,
      data: {
        accessToken,
        user,
        redirect: null,
        refreshToken,
      },
    };
  }

  static async logout(token) {
    if (!token) {
      throw new ValidationError("No Refresh Token Provided");
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
      throw new ValidationError("No Refresh Token Provided");
    }

    const session = await SessionRepository.findByToken(token);

    if (session) {
      session.sessions = session.sessions.filter(
        (s) => token === s.refreshToken,
      );

      await session.save();
    }

    return {
      message: messages.AUTH.LOGOUT.SUCCESS_ALL,
    };
  }

  static async refreshAccessTokenAndGenerateNewRefreshToken(token, agent, ip) {
    try {
      if (!token) {
        throw new ValidationError("No Refresh Token Provided");
      }

      const { issuer, secret } = config.jwt;
      const decoded = jwt.verify(token, secret.refresh, { issuer });

      const session = await SessionRepository.findByToken(token);
      if (!session) {
        // TODO: should this be fatal??
        logger.fatal("Security Alert: Attempted refresh token reuse detected.");
        await SessionRepository.updateOne(decoded.id, { sessions: [] });
        throw new ForbiddenError(messages.ERROR.REFRESH_TOKEN_REUSE);
      } else if (decoded.id !== session.userId.toString()) {
        throw new ForbiddenError("Invalid Refresh Token");
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
        throw new NotFoundError(messages.ERROR.NOT_FOUND_Fn("User"));
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

  static async initiatePasswordReset(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError(messages.ERROR.NOT_FOUND_Fn("User"));
    }

    if (user.role.name !== USER_ROLES.ADMIN) {
      const tenant = await TenantRepository.findById(user.tenantId);
      if (!tenant) {
        throw new Error("Failed to fetch configuration, tenant not found.");
      } else if (!tenant.configurations.allowUserPasswordReset) {
        throw new ForbiddenError(messages.AUTH.NO_PASSWORD_RESET);
      }
    }

    const ttl = 10; // in minutes;
    const newToken = TokenEntity.make({
      userId: user._id,
      type: TOKEN_TYPES.RESET_PWD,
      ttl,
    });
    await TokenRepository.upsert(newToken);

    await MailService.send({
      to: email,
      templateName: "password-reset",
      context: {
        name: user.firstName,
        otp: newToken.value,
        expiresIn: ttl,
      },
    });

    return {
      message: "Password Reset Initiated",
      data: {
        email,
      },
    };
  }

  static async resetUserPasswordWithVerification({ email, token, password }) {
    const session = await startSession();
    session.startTransaction();

    try {
      const [user, result] = await Promise.all([
        UserRepository.findByEmail(email),
        TokenService.findByTokenAndValidate(token, TOKEN_TYPES.RESET_PWD),
      ]);
      if (!user) {
        throw new NotFoundError(messages.ERROR.NOT_FOUND_Fn("User"));
      }

      if (user.role.name !== USER_ROLES.ADMIN) {
        const tenant = await TenantRepository.findById(user.tenantId);
        if (!tenant) {
          throw new Error("Failed to fetch configuration, tenant not found.");
        } else if (!tenant.configurations.allowUserPasswordReset) {
          throw new ForbiddenError(messages.AUTH.NO_PASSWORD_RESET);
        }
      }

      if (!result.isValid) {
        throw new ValidationError(result.reason);
      }

      await Promise.all([
        user.updateOne({ password }, { session }),
        TokenRepository.deleteOne({
          value: token,
          type: TOKEN_TYPES.RESET_PWD,
        }),
      ]);

      await MailService.send({
        to: email,
        templateName: "password-change",
        // TODO: change this to a user friendly date string
        context: {
          name: user.firstName,
          timestamp: new Date().toUTCString(),
        },
      });

      await session.commitTransaction();

      return {
        message: messages.AUTH.PASSWORD_RESET,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  static async resetUserPasswordWithoutVerification({
    email,
    currentPassword,
    newPassword,
  }) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError(messages.ERROR.NOT_FOUND_Fn("User"));
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Incorrect Password");
    }

    await user.updateOne({ password: newPassword });

    await MailService.send({
      to: email,
      templateName: "change-password",
      // TODO: change this to a user friendly date string
      context: {
        name: user.firstName,
        timestamp: new Date().toUTCString(),
      },
    });

    return {
      message: messages.AUTH.PASSWORD_RESET,
    };
  }
}

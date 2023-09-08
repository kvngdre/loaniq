import jwt from "jsonwebtoken";
import { startSession } from "mongoose";

import { config } from "../../config/index.js";
import { SessionEntity } from "../../data/entities/session.entity.js";
import ClientRepository from "../../data/repositories/client.dao.js";
import {
  SessionRepository,
  TenantRepository,
  UserRepository,
} from "../../data/repositories/index.js";
import {
  ConflictError,
  DependencyError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
  ValidationError,
} from "../../utils/errors/index.js";
import { generateOTP, logger, messages } from "../../utils/index.js";
import { JwtService } from "./jwt.service.js";
import { MailService } from "./mail.service.js";
import { TokenService } from "./token.service.js";

export class AuthService {
  static async register(registerDto) {
    const session = await startSession();
    session.startTransaction();

    try {
      const token = TokenService.generateToken(6);

      const [user, tenant] = await Promise.all([
        UserRepository.insert(
          { role: "admin", resetPassword: false, ...registerDto },
          session,
        ),
        TenantRepository.insert(registerDto, session),
      ]);

      await TokenService.create(
        {
          userId: user._id,
          token: token.value,
          type: "register",
          expires: token.expires,
        },
        session,
      );

      const { error } = await MailService.send({
        to: registerDto.email,
        templateName: "new-tenant-user",
        context: {
          name: registerDto.firstName,
          otp: token.value,
          expiresIn: token.ttl,
        },
      });
      if (error) {
        // TODO: improve this later
        throw new ServerError(
          `Registration Failed. Error mailing OTP`,
          error.stack,
        );
      }

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
      // "configurations.lastLoginTime": new Date(),
      isEmailVerified: true,
      active: true,
    });

    await Promise.all([
      TokenService.deleteOne({ userId: foundUser._id, type: "register" }),
      foundUser.save(),
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
      SessionRepository.insert(newSession);
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

  static async logOutAllSessions(userId, token) {
    const userConfig = await userConfigService.getConfig({ userId });

    // ! Prune refresh token array for expired refresh tokens.
    userConfig.sessions = userConfig.sessions.filter((s) => s.token !== token);
    await userConfig.save();

    return userConfig;
  }

  static async getNewTokens(token) {
    const { issuer, secret } = config.jwt;
    try {
      const decoded = jwt.verify(token, secret.refresh, { issuer });
      if (decoded.client) {
        const foundClient = await ClientRepository.findOne({
          "sessions.token": token,
        }).catch(async () => {
          logger.warn("Attempted refresh token reuse detected.");

          await ClientRepository.update(decoded.id, { sessions: null }).catch(
            (err) => {
              logger.error(err.message, err.stack);
            },
          );

          throw new ForbiddenError("Forbidden");
        });

        // Validating if token payload is valid
        if (decoded.id != foundClient._id) {
          throw new ForbiddenError("Invalid token");
        }

        // Generating tokens
        const accessToken = generateAccessToken({
          id: foundClient._id,
          client: true,
        });
        const refreshToken = generateRefreshToken({
          id: foundClient._id,
          client: true,
        });

        // Updating client session with new tokens
        foundClient.session.token = refreshToken;
        foundClient.session.expiresIn =
          Date.now() + config.jwt.exp_time.refresh * 1_000;
        await foundClient.updateOne({
          "session.token": refreshToken,
          "session.expiresIn": Date.now() + config.jwt.exp_time.refresh * 1_000,
        });

        return [accessToken, refreshToken];
      }

      // ! Tenant user requesting for new tokens.
      const foundUserConfig = await userConfigService
        .getConfig({ "sessions.token": token })
        .catch(async () => {
          logger.warn("Attempted refresh token reuse detected.");

          await userConfigService
            .updateConfig(decoded.id, { sessions: [] })
            .catch((err) => {
              logger.error(err.message, err.stack);
            });

          throw new ForbiddenError("Forbidden");
        });

      // Validating if token payload is valid
      if (decoded.id !== foundUserConfig.userId) {
        throw new ForbiddenError("Invalid token");
      }

      const currentSession = {
        ...foundUserConfig.sessions.find((s) => s.token === token),
      };

      // ! Prune user sessions for expired refresh tokens.
      const filteredSessions = foundUserConfig.sessions.filter(
        (s) => s.token !== token && Date.now() < s.expiresIn,
      );

      // Generating tokens
      const accessToken = generateAccessToken({ id: foundUserConfig.userId });
      const refreshToken = generateRefreshToken({ id: foundUserConfig.userId });

      currentSession.token = refreshToken;
      currentSession.expiresIn =
        Date.now() + config.jwt.exp_time.refresh * 1_000;

      foundUserConfig.set({
        sessions: [currentSession, ...filteredSessions],
      });
      await foundUserConfig.save();

      return [accessToken, refreshToken];
    } catch (exception) {
      if (exception instanceof jwt.JsonWebTokenError) {
        throw new ForbiddenError(exception.message);
      }

      throw exception;
    }
  }

  static async sendOTP({ email, len }) {
    const generatedOTP = generateOTP(len);

    const foundUser = await UserRepository.update(
      { email },
      { otp: generatedOTP },
    );

    // Sending OTP to user email
    const info = await MailService.send({
      to: email,
      templateName: "otp-request",
      context: { otp: generatedOTP.pin, expiresIn: 10 },
    });
    if (info.error) {
      throw new DependencyError("Error sending OTP to email.");
    }

    return foundUser;
  }
}

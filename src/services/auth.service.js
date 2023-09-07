import jwt from "jsonwebtoken";
import { startSession } from "mongoose";

import { constants } from "../config/index.js";
import ClientRepository from "../data/repositories/client.dao.js";
import { TokenRepository, UserRepository } from "../data/repositories/index.js";
import {
  ConflictError,
  DependencyError,
  ForbiddenError,
  UnauthorizedError,
} from "../utils/errors/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateJWT.js";
import generateOTP from "../utils/generateOTP.js";
import generateSession from "../utils/generateSession.js";
import { logger } from "../utils/logger.js";
import { EmailService } from "./email.service.js";
import { TenantService } from "./tenant.service.js";
import { TokenService } from "./token.service.js";
import { UserService } from "./user.service.js";

export class AuthService {
  static async register(signUpDto) {
    const session = await startSession();
    session.startTransaction();

    try {
      const newUser = await UserRepository.save(
        { role: "admin", resetPwd: false, ...signUpDto },
        session,
      );

      await TenantService.create(signUpDto, session);
      await UserService.create(signUpDto);
      const token = TokenService.generateToken(6);

      await TokenRepository.save(
        {
          user: newUser._id,
          token: token.value,
          type: "sign-up token",
          expirationTime: token.expires,
          isUsed: false,
        },
        session,
      );

      await EmailService.send({
        to: signUpDto.email,
        templateName: "new-tenant-user",
        context: {
          name: newUser.firstName,
          otp: token.value,
          expiresIn: token.ttl,
        },
      });

      await session.commitTransaction();

      return {
        message: "You have successfully signed up for the service.",
        next_steps: [
          "Check email for an OTP to verify your account.",
          "Log in and explore the features.",
          "Customize your profile, manage your settings, and access our support.",
        ],
      };
    } catch (exception) {
      await session.abortTransaction();

      throw exception;
    } finally {
      await session.endSession();
    }
  }

  static async login(loginDTO, token, userAgent, clientIp) {
    if (loginDTO.email) {
      // ! Tenant login
      const { email, password } = loginDTO;
      const foundUser = await UserRepository.findOne({ email });

      const isValid = foundUser.validatePassword(password);
      if (!isValid) throw new UnauthorizedError("Invalid credentials");

      const { isPermitted, message, data } = foundUser.permitLogin();
      if (!isPermitted) throw new ForbiddenError(message, data);

      const userConfig = await userConfigService.getConfig({
        userId: foundUser._id,
      });

      // ! Prune user sessions for expired refresh tokens.
      if (token) {
        userConfig.sessions = userConfig.sessions.filter(
          (s) => s.token !== token && Date.now() < s.expiresIn,
        );
      } else {
        userConfig.sessions = userConfig.sessions.filter(
          (s) => Date.now() < s.expiresIn,
        );
      }

      if (userConfig.sessions.length >= 3) {
        throw new ConflictError("Maximum allowed devices reached.");
      }

      const accessToken = generateAccessToken({ id: foundUser._id });
      const refreshToken = generateRefreshToken({ id: foundUser._id });
      const newSession = generateSession(refreshToken, userAgent, clientIp);

      await Promise.all([
        foundUser.updateOne({ last_login_time: new Date() }),
        userConfig.updateOne({
          sessions: [newSession, ...userConfig.sessions],
        }),
        // EmailService.send({
        //   to: email,
        //   templateName: 'tenant-login',
        //   context: { loginTime: new Date() }
        // })
      ]);

      foundUser.purgeSensitiveData();

      return [{ user: foundUser, accessToken, redirect: null }, refreshToken];
    }

    // ! Client login
    const { phoneOrStaffId, passcode } = loginDTO;
    const foundClient = await ClientRepository.findOne({
      $or: [{ phone_number: phoneOrStaffId }, { staff_id: phoneOrStaffId }],
    });

    const isValid = foundClient.validatePasscode(passcode);
    if (!isValid) throw new UnauthorizedError("Invalid credentials");

    const { isPermitted, message, data } = foundClient.permitLogin();
    if (!isPermitted) throw new ForbiddenError(message, data);

    const accessToken = generateAccessToken({
      id: foundClient._id,
      client: true,
    });
    const refreshToken = generateRefreshToken({
      id: foundClient._id,
      client: true,
    });
    const newSession = generateSession(refreshToken, userAgent, clientIp);

    await foundClient.updateOne({
      session: newSession,
      last_login_time: new Date(),
    });

    foundClient.purgeSensitiveData();

    return [{ client: foundClient, accessToken, redirect: null }, refreshToken];
  }

  static async getNewTokens(token) {
    const { issuer, secret } = constants.jwt;
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
          Date.now() + constants.jwt.exp_time.refresh * 1_000;
        await foundClient.updateOne({
          "session.token": refreshToken,
          "session.expiresIn":
            Date.now() + constants.jwt.exp_time.refresh * 1_000,
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
        Date.now() + constants.jwt.exp_time.refresh * 1_000;

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
    const info = await EmailService.send({
      to: email,
      templateName: "otp-request",
      context: { otp: generatedOTP.pin, expiresIn: 10 },
    });
    if (info.error) {
      throw new DependencyError("Error sending OTP to email.");
    }

    return foundUser;
  }

  static async logout(token) {
    try {
      const userConfig = await userConfigService.getConfig({
        "sessions.token": token,
      });

      userConfig.sessions = userConfig.sessions.filter(
        (s) => s.token !== token && Date.now() < s.expiresIn,
      );
      await userConfig.save();
    } catch (exception) {
      logger.warn(exception.message);
    }
  }

  static async signOutAllSessions(userId, token) {
    const userConfig = await userConfigService.getConfig({ userId });

    // ! Prune refresh token array for expired refresh tokens.
    userConfig.sessions = userConfig.sessions.filter((s) => s.token !== token);
    await userConfig.save();

    return userConfig;
  }
}

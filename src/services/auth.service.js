/* eslint-disable camelcase */
/* eslint-disable eqeqeq */
import { constants } from '../config/index.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateJWT.js';
import ConflictError from '../errors/ConflictError.js';
import DependencyError from '../errors/DependencyError.js';
import EmailService from './email.service.js';
import ForbiddenError from '../errors/ForbiddenError.js';
import generateOTP from '../utils/generateOTP.js';
import generateSession from '../utils/generateSession.js';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import userConfigService from './userConfig.service.js';
import UserDAO from '../daos/user.dao.js';
import ClientDAO from '../daos/client.dao.js';

class AuthService {
  static async login(loginDTO, token, userAgent, clientIp) {
    if (loginDTO.email) {
      // ! Tenant login
      const { email, password } = loginDTO;
      const foundUser = await UserDAO.findOne({ email });

      const isValid = foundUser.validatePassword(password);
      if (!isValid) throw new UnauthorizedError('Invalid credentials');

      const { isPermitted, message, data } = foundUser.permitLogin();
      if (!isPermitted) throw new ForbiddenError(message, data);

      const userConfig = await userConfigService.getConfig({
        userId: foundUser._id,
      });

      // ! Prune user sessions for expired refresh tokens.
      if (token) {
        userConfig.sessions = userConfig.sessions.filter((s) => s.token !== token && Date.now() < s.expiresIn);
      } else {
        userConfig.sessions = userConfig.sessions.filter((s) => Date.now() < s.expiresIn);
      }

      if (userConfig.sessions.length >= 3) {
        throw new ConflictError('Maximum allowed devices reached.');
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
    const foundClient = await ClientDAO.findOne({
      $or: [{ phone_number: phoneOrStaffId }, { staff_id: phoneOrStaffId }],
    });

    const isValid = foundClient.validatePasscode(passcode);
    if (!isValid) throw new UnauthorizedError('Invalid credentials');

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
        const foundClient = await ClientDAO.findOne({
          'sessions.token': token,
        }).catch(async () => {
          logger.warn('Attempted refresh token reuse detected.');

          await ClientDAO.update(decoded.id, { sessions: null }).catch((err) => {
            logger.error(err.message, err.stack);
          });

          throw new ForbiddenError('Forbidden');
        });

        // Validating if token payload is valid
        if (decoded.id != foundClient._id) {
          throw new ForbiddenError('Invalid token');
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
        foundClient.session.expiresIn = Date.now() + constants.jwt.exp_time.refresh * 1_000;
        await foundClient.updateOne({
          'session.token': refreshToken,
          'session.expiresIn': Date.now() + constants.jwt.exp_time.refresh * 1_000,
        });

        return [accessToken, refreshToken];
      }

      // ! Tenant user requesting for new tokens.
      const foundUserConfig = await userConfigService.getConfig({ 'sessions.token': token }).catch(async () => {
        logger.warn('Attempted refresh token reuse detected.');

        await userConfigService.updateConfig(decoded.id, { sessions: [] }).catch((err) => {
          logger.error(err.message, err.stack);
        });

        throw new ForbiddenError('Forbidden');
      });

      // Validating if token payload is valid
      if (decoded.id != foundUserConfig.userId) {
        throw new ForbiddenError('Invalid token');
      }

      const currentSession = Object.assign(
        {},
        foundUserConfig.sessions.find((s) => s.token === token),
      );

      // ! Prune user sessions for expired refresh tokens.
      const filteredSessions = foundUserConfig.sessions.filter((s) => s.token !== token && Date.now() < s.expiresIn);

      // Generating tokens
      const accessToken = generateAccessToken({ id: foundUserConfig.userId });
      const refreshToken = generateRefreshToken({ id: foundUserConfig.userId });

      currentSession.token = refreshToken;
      currentSession.expiresIn = Date.now() + constants.jwt.exp_time.refresh * 1_000;

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

  static async sendOTP({ email, phone, len }) {
    const generatedOTP = generateOTP(len);

    if (email) {
      const foundUser = await UserDAO.update({ email }, { otp: generatedOTP });

      // Sending OTP to user email
      const info = await EmailService.send({
        to: email,
        templateName: 'otp-request',
        context: { otp: generatedOTP.pin, expiresIn: 10 },
      });
      if (info.error) {
        throw new DependencyError('Error sending OTP to email.');
      }

      return foundUser;
    }
  }

  static async logout(token) {
    try {
      const userConfig = await userConfigService.getConfig({
        'sessions.token': token,
      });

      userConfig.sessions = userConfig.sessions.filter((s) => s.token !== token && Date.now() < s.expiresIn);
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

export default AuthService;

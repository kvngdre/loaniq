/* eslint-disable camelcase */
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/index.js';
import DependencyError from '../errors/dependency.error.js';
import DuplicateError from '../errors/duplicate.error.js';
import UnauthorizedError from '../errors/unauthorized.error.js';
import ValidationError from '../errors/validation.error.js';
import { events, pubsub } from '../pubsub/index.js';
import EmailService from '../services/email.service.js';
import UserConfigService from '../services/userConfig.service.js';
import driverUploader from '../utils/driveUploader.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/generateJWT.js';
import generateSession from '../utils/generateSession.js';
import logger from '../utils/logger.js';
import mailer from '../utils/mailer.js';
import randomString from '../utils/randomString.js';
import similarity from '../utils/stringSimilarity.js';
import UserDAO from './user.repository.js';

class UserService {
  static createUser = async (newUserDTO) => {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        newUserDTO.password = randomString();

        const [newUser] = await Promise.all([
          UserDAO.insert(newUserDTO, session),
          UserConfigService.createConfig(
            {
              userId: newUserDTO._id,
              tenantId: newUserDTO.tenantId,
            },
            session,
          ),
        ]);

        // Send temporary password to new user email.
        const info = await EmailService.send({
          to: newUserDTO.email,
          templateName: 'new-user',
          context: {
            name: newUserDTO.first_name,
            password: newUserDTO.password,
          },
        });
        if (info.error) {
          throw new DependencyError('Failed to send password to user email.');
        }

        newUser.purgeSensitiveData();

        return newUser;
      });

      return result;
    } finally {
    }
  };

  static verifyNewUser = async (verifyNewUserDTO, userAgent, clientIp) => {
    const { email, otp, current_password, new_password } = verifyNewUserDTO;

    const foundUser = await UserDAO.findOne({ email });
    if (foundUser.isEmailVerified) {
      throw new DuplicateError('Account already verified, please sign in.');
    }

    if (otp) {
      const { isValid, reason } = foundUser.validateOTP(otp);
      if (!isValid) throw new ValidationError(reason);

      foundUser.set({ 'otp.pin': null, 'otp.expiresIn': null });
    } else {
      const isValid = foundUser.validatePassword(current_password);
      if (!isValid) throw new UnauthorizedError('Password is incorrect.');

      // * Measuring similarity of new password to the current temporary password.
      const similarityPercent =
        similarity(new_password, current_password) * 100;
      if (similarityPercent >= config.max_similarity) {
        throw new ValidationError('Password is too similar to old password.');
      }

      // Setting user password
      foundUser.set({ password: new_password });
    }

    foundUser.set({
      last_login_time: new Date(),
      isEmailVerified: true,
      active: true,
      resetPwd: false,
    });

    const userConfig = await UserConfigService.getConfig({
      userId: foundUser._id,
    });

    const accessToken = generateAccessToken({ id: foundUser._id });
    const refreshToken = generateRefreshToken({ id: foundUser._id });
    const newSession = generateSession(refreshToken, userAgent, clientIp);

    await Promise.all([
      foundUser.save(),
      userConfig.updateOne({ sessions: [newSession, ...userConfig.sessions] }),
    ]);

    // mailer({
    //   to: foundUser.email,
    //   subject: 'Welcome to AIdea!',
    //   name: foundUser.first_name,
    //   template: 'new-tenant'
    // })

    foundUser.purgeSensitiveData();

    return { accessToken, refreshToken, foundUser };
  };

  static getUsers = async (
    tenantId,
    projection = { password: 0, resetPwd: 0, otp: 0 },
  ) => {
    const foundUsers = await UserDAO.find({ tenantId }, projection);
    const count = Intl.NumberFormat('en-US').format(foundUsers.length);

    return { count, users: foundUsers };
  };

  static getUserById = async (
    userId,
    projection = { password: 0, resetPwd: 0, otp: 0 },
  ) => {
    const foundUser = await UserDAO.findById(userId, projection);

    return foundUser;
  };

  static getUser = async (
    filter,
    projection = { password: 0, resetPwd: 0, otp: 0 },
  ) => {
    const foundUser = await UserDAO.findOne(filter, projection);

    return foundUser;
  };

  static getCurrentUser = async (userId) => {
    const foundUser = await UserDAO.findById(userId);

    foundUser.purgeSensitiveData();

    return foundUser;
  };

  /**
   * Updates a user's record
   * @param {string} userId The user id.
   * @param {UserUpdate} updateUserDTO
   * @param {object} [projection] The fields to include or exclude.
   * @returns
   */
  static updateUser = async (
    userId,
    updateUserDTO,
    projection = { password: 0, resetPwd: 0, otp: 0 },
  ) => {
    const updatedUser = await UserDAO.update(
      { userId },
      updateUserDTO,
      projection,
    );

    return updatedUser;
  };

  static updateBulk = async (filter, updateDTO) => {
    const result = await UserDAO.updateMany(filter, updateDTO);

    return result;
  };

  static deleteUser = async (userId) => {
    const [deletedUser] = await Promise.all([
      UserDAO.remove(userId),
      UserConfigService.deleteConfig(userId),
    ]);

    return deletedUser;
  };

  static changePassword = async (userId, changePasswordDTO) => {
    const { current_password, new_password } = changePasswordDTO;

    const foundUser = await UserDAO.findById(userId);

    const isMatch = foundUser.comparePasswords(current_password);
    if (!isMatch) throw new UnauthorizedError('Password is incorrect.');

    const percentageSimilarity =
      similarity(new_password, current_password) * 100;

    if (percentageSimilarity >= config.max_similarity) {
      throw new ValidationError('Password is too similar to old password.');
    }

    const formatter = new Intl.DateTimeFormat('en-GB', {
      month: 'long',
      year: 'numeric',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Send temporary password to new user email.
    const info = await EmailService.send({
      to: foundUser.email,
      templateName: 'user_password_change',
      context: {
        name: foundUser.first_name,
        datetime: formatter.format(new Date()),
      },
    });
    if (info.error) {
      throw new DependencyError('Failed to send password to user email.');
    }

    // ! Notify user of password change
    logger.debug('Sending password change email...');
    mailer({
      to: foundUser.email,
      subject: 'Password changed',
      name: foundUser.first_name,
      template: 'password-change',
    });

    foundUser.set({ password: new_password });
    await foundUser.save();

    foundUser.purgeSensitiveData();

    return foundUser;
  };

  static forgotPassword = async ({ email, new_password }) => {
    logger.info('Sending password change email...');
    const [user] = await Promise.all([
      UserDAO.update({ email }, { password: new_password, resetPwd: false }),
      mailer({
        to: email,
        subject: 'Password changed',
        template: 'password-change',
      }),
    ]);

    user.purgeSensitiveData();

    return user;
  };

  static resetPassword = async (userId) => {
    const randomPwd = randomString(6);

    const foundUser = await UserDAO.update(userId, {
      resetPwd: true,
      password: randomPwd,
    });

    logger.info('Sending password reset mail...');
    await mailer({
      to: foundUser.email,
      subject: 'Password reset triggered',
      name: foundUser.first_name,
      template: 'password-reset',
      payload: { password: randomPwd },
    });

    foundUser.purgeSensitiveData();

    return foundUser;
  };

  static deactivateUser = async (userId, { password }) => {
    const foundUser = await UserDAO.findById(userId);

    const isMatch = foundUser.comparePasswords(password);
    if (!isMatch) throw new UnauthorizedError('Password is incorrect.');

    pubsub.publish(events.user.resetPwd, { userId }, { sessions: [] });

    foundUser.set({ active: false, sessions: [] });
    await foundUser.save();
    // ? Should a notification email be sent to the user?

    foundUser.purgeSensitiveData();

    return foundUser;
  };

  static reactivateUser = async (userId) => {
    const foundUser = await UserDAO.update(userId, { active: true });

    foundUser.purgeSensitiveData();

    return foundUser;
  };

  static uploadImage = async ({ userId, tenantId }, uploadFile) => {
    const foundUser = await UserDAO.findById(userId, {
      password: 0,
      resetPwd: 0,
      otp: 0,
    });
    const folderName = `t-${tenantId.toString()}`;

    const [foundFolder] = await driverUploader.findFolder(folderName);

    // Selecting folder
    const folderId = foundFolder?.id
      ? foundFolder.id
      : await driverUploader.createFolder(folderName);

    // const newFolderId = await driverUploader.createFolder('users', folderId)

    const name = uploadFile.originalname;
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const filePath = path.resolve(__dirname, `../../${uploadFile.path}`);
    const mimeType = uploadFile.mimetype;

    const response = await driverUploader.createFile(
      name,
      filePath,
      folderId,
      mimeType,
    );
    logger.debug(response.data.id);

    foundUser.set({
      avatar: response.data.id,
    });

    // ! Delete uploaded file from file system
    fs.unlinkSync(filePath);

    await foundUser.save();
    return foundUser;
  };
}

export default UserService;

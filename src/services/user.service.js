import { startSession } from "mongoose";

import { constants } from "../config/index.js";
import { UserRepository } from "../data/repositories/index.js";
import { events, pubsub } from "../pubsub/index.js";
import {
  ConflictError,
  DependencyError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateJWT.js";
import generateSession from "../utils/generateSession.js";
import { calcSimilarity, genRandomString } from "../utils/index.js";
import { logger } from "../utils/logger.js";
import mailer from "../utils/mailer.js";
import { EmailService } from "./email.service.js";

export class UserService {
  static async create(createUserDTO) {
    const session = await startSession();
    session.startTransaction();

    try {
      const password = genRandomString(6);
      const newUser = await UserRepository.save(
        { ...createUserDTO, password },
        session,
      );

      // Send temporary password to new user email.
      const info = await EmailService.send({
        to: createUserDTO.email,
        templateName: "new-user",
        context: {
          name: createUserDTO.first_name,
          password,
        },
      });

      if (info.error) {
        throw new DependencyError("Failed to send password to user email");
      }

      return newUser.purgeSensitiveData();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  static verifyNewUser = async (verifyNewUserDTO, userAgent, clientIp) => {
    const { email, otp, current_password, new_password } = verifyNewUserDTO;

    const foundUser = await userRepository.findOne({ email });
    if (foundUser.isEmailVerified) {
      throw new ConflictError("Account already verified, please sign in.");
    }

    if (otp) {
      const { isValid, reason } = foundUser.validateOTP(otp);
      if (!isValid) throw new ValidationError(reason);

      foundUser.set({ "otp.pin": null, "otp.expiresIn": null });
    } else {
      const isValid = foundUser.validatePassword(current_password);
      if (!isValid) throw new UnauthorizedError("Password is incorrect.");

      // * Measuring similarity of new password to the current temporary password.
      const similarityPercent =
        calcSimilarity(new_password, current_password) * 100;
      if (similarityPercent >= constants.max_similarity) {
        throw new ValidationError("Password is too similar to old password.");
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
    const foundUsers = await userRepository.find({ tenantId }, projection);
    const count = Intl.NumberFormat("en-US").format(foundUsers.length);

    return { count, users: foundUsers };
  };

  static getUserById = async (
    userId,
    projection = { password: 0, resetPwd: 0, otp: 0 },
  ) => {
    const foundUser = await userRepository.findById(userId, projection);

    return foundUser;
  };

  static getUser = async (
    filter,
    projection = { password: 0, resetPwd: 0, otp: 0 },
  ) => {
    const foundUser = await userRepository.findOne(filter, projection);

    return foundUser;
  };

  static getCurrentUser = async (userId) => {
    const foundUser = await userRepository.findById(userId);

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
    const updatedUser = await userRepository.update(
      { userId },
      updateUserDTO,
      projection,
    );

    return updatedUser;
  };

  static updateBulk = async (filter, updateDTO) => {
    const result = await userRepository.updateMany(filter, updateDTO);

    return result;
  };

  static deleteUser = async (userId) => {
    const [deletedUser] = await Promise.all([
      userRepository.remove(userId),
      UserConfigService.deleteConfig(userId),
    ]);

    return deletedUser;
  };

  static changePassword = async (userId, changePasswordDTO) => {
    const { current_password, new_password } = changePasswordDTO;

    const foundUser = await userRepository.findById(userId);

    const isMatch = foundUser.comparePasswords(current_password);
    if (!isMatch) throw new UnauthorizedError("Password is incorrect.");

    const percentageSimilarity =
      calcSimilarity(new_password, current_password) * 100;

    if (percentageSimilarity >= constants.max_similarity) {
      throw new ValidationError("Password is too similar to old password.");
    }

    const formatter = new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Send temporary password to new user email.
    const info = await EmailService.send({
      to: foundUser.email,
      templateName: "user_password_change",
      context: {
        name: foundUser.first_name,
        datetime: formatter.format(new Date()),
      },
    });
    if (info.error) {
      throw new DependencyError("Failed to send password to user email.");
    }

    // ! Notify user of password change
    logger.debug("Sending password change email...");
    mailer({
      to: foundUser.email,
      subject: "Password changed",
      name: foundUser.first_name,
      template: "password-change",
    });

    foundUser.set({ password: new_password });
    await foundUser.save();

    foundUser.purgeSensitiveData();

    return foundUser;
  };

  static forgotPassword = async ({ email, new_password }) => {
    logger.info("Sending password change email...");
    const [user] = await Promise.all([
      userRepository.update(
        { email },
        { password: new_password, resetPwd: false },
      ),
      mailer({
        to: email,
        subject: "Password changed",
        template: "password-change",
      }),
    ]);

    user.purgeSensitiveData();

    return user;
  };

  static resetPassword = async (userId) => {
    const randomPwd = genRandomString(6);

    const foundUser = await userRepository.update(userId, {
      resetPwd: true,
      password: randomPwd,
    });

    logger.info("Sending password reset mail...");
    await mailer({
      to: foundUser.email,
      subject: "Password reset triggered",
      name: foundUser.first_name,
      template: "password-reset",
      payload: { password: randomPwd },
    });

    foundUser.purgeSensitiveData();

    return foundUser;
  };

  static deactivateUser = async (userId, { password }) => {
    const foundUser = await userRepository.findById(userId);

    const isMatch = foundUser.comparePasswords(password);
    if (!isMatch) throw new UnauthorizedError("Password is incorrect.");

    pubsub.publish(events.user.resetPwd, { userId }, { sessions: [] });

    foundUser.set({ active: false, sessions: [] });
    await foundUser.save();
    // ? Should a notification email be sent to the user?

    foundUser.purgeSensitiveData();

    return foundUser;
  };

  static reactivateUser = async (userId) => {
    const foundUser = await userRepository.update(userId, { active: true });

    foundUser.purgeSensitiveData();

    return foundUser;
  };
}

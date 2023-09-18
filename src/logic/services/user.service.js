import { randomBytes } from "crypto";
import { startSession } from "mongoose";

import { config } from "../../config/index.js";
import { UserRepository } from "../../data/repositories/index.js";
import { events, pubsub } from "../../pubsub/index.js";
import {
  DependencyError,
  UnauthorizedError,
  ValidationError,
} from "../../utils/errors/index.js";
import { calcSimilarity, genRandomString, logger } from "../../utils/index.js";
import { MailService } from "./mail.service.js";

export class UserService {
  static async create(createUserDTO) {
    const session = await startSession();
    session.startTransaction();

    try {
      const randomPassword = randomBytes(4).toString("hex");
      const newUser = await UserRepository.insert(
        { ...createUserDTO, password: randomPassword },
        session,
      );

      const { error } = await MailService.send({
        to: createUserDTO.email,
        templateName: "new-user",
        context: {
          name: createUserDTO.first_name,
          password: randomPassword,
        },
      });

      if (error) {
        throw new DependencyError("Failed to send password to user email");
      }

      await session.commitTransaction();

      return newUser.purgeSensitiveData();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

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

    if (percentageSimilarity >= config.max_similarity) {
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
    const info = await MailService.send({
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

import { randomBytes } from "crypto";
import { startSession } from "mongoose";

import { config } from "../../config/index.js";
import { UserRepository } from "../../data/repositories/index.js";
import { events, pubsub } from "../../pubsub/index.js";
import {
  DependencyError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../utils/errors/index.js";
import {
  calcSimilarity,
  genRandomString,
  logger,
  messages,
} from "../../utils/index.js";
import { UserDto } from "../dtos/index.js";
import { MailService } from "./mail.service.js";

export class UserService {
  static async create(createUserDTO, tenantId) {
    const session = await startSession();
    session.startTransaction();

    try {
      const randomPassword = randomBytes(4).toString("hex");
      const user = await UserRepository.insert(
        { ...createUserDTO, password: randomPassword, tenantId },
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
        throw new DependencyError("Error sending password to user email");
      }

      await session.commitTransaction();

      return {
        message: messages.COMMON.CREATED_Fn("User"),
        data: UserDto.from({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          jobTitle: user.jobTitle,
          phoneNumber: user.phoneNumber,
          email: user.email,
          role: user.role.name,
          status: user.status,
          configurations: user.configurations,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }),
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  static async all() {
    const users = await UserRepository.find();
    if (users.length === 0) {
      throw new NotFoundError(messages.ERROR.NOT_FOUND_Fn("Users"));
    }

    return {
      message: messages.COMMON.FETCHED_Fn("Users"),
      data: UserDto.fromMany(users),
    };
  }

  static async getUserById(id) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError(messages.ERROR.NOT_FOUND_Fn("User"));
    }

    return UserDto.from({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      jobTitle: user.jobTitle,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role.name,
      status: user.status,
      configurations: user.configurations,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  static async getUser(filter) {
    const user = await UserRepository.findOne(filter);
    if (!user) {
      throw new NotFoundError(messages.ERROR.NOT_FOUND_Fn("User"));
    }

    return UserDto.from({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      jobTitle: user.jobTitle,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role.name,
      status: user.status,
      configurations: user.configurations,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  static getCurrentUser = async (userId) => {
    const foundUser = await UserRepository.findById(userId);

    foundUser.purgeSensitiveData();

    return foundUser;
  };

  /**
   * Updates a user's record
   * @param {string} id The user id.
   * @param {UserUpdate} updateUserDTO
   * @param {object} [projection] The fields to include or exclude.
   * @returns
   */
  static updateUser = async (id, updateUserDTO) => {
    const updatedUser = await UserRepository.updateById(id, updateUserDTO);

    return updatedUser;
  };

  static updateBulk = async (filter, updateDTO) => {
    const result = await UserRepository.updateMany(filter, updateDTO);

    return result;
  };

  static async delete(id) {
    return UserRepository.deleteById(id);
  }

  static changePassword = async (userId, changePasswordDTO) => {
    const { currentPassword, newPassword } = changePasswordDTO;

    const user = await UserRepository.findById(userId);

    const isMatch = user.comparePasswords(currentPassword);
    if (!isMatch) throw new UnauthorizedError("Password is incorrect.");

    const percentageSimilarity =
      calcSimilarity(newPassword, currentPassword) * 100;

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
      to: user.email,
      templateName: "user_password_change",
      context: {
        name: user.first_name,
        datetime: formatter.format(new Date()),
      },
    });
    if (info.error) {
      throw new DependencyError("Failed to send password to user email.");
    }

    // ! Notify user of password change
    logger.debug("Sending password change email...");
    MailService.send({
      to: user.email,
      context: { name: user.firstName },
      template: "password-change",
    });

    user.set({ password: newPassword });
    await user.save();

    user.purgeSensitiveData();

    return user;
  };

  static resetPassword = async (userId) => {
    const randomPwd = genRandomString(6);

    const user = await UserRepository.update(userId, {
      resetPwd: true,
      password: randomPwd,
    });

    logger.info("Sending password reset mail...");
    await MailService.send({
      to: user.email,
      context: { name: user.first_name, password: randomPwd },
      template: "password-reset",
    });

    return user;
  };

  static deactivateUser = async (userId, { password }) => {
    const foundUser = await UserRepository.findById(userId);

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
    const foundUser = await UserRepository.update(userId, { active: true });

    foundUser.purgeSensitiveData();

    return foundUser;
  };
}

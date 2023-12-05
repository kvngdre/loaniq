import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { startSession } from "mongoose";

import { config } from "../../config/index.js";
import {
  SessionRepository,
  UserRepository,
} from "../../data/repositories/index.js";
import {
  DependencyError,
  NotFoundError,
  ValidationError,
} from "../../utils/errors/index.js";
import { USER_STATUS } from "../../utils/helpers/user.helper.js";
import {
  calculatePercentageStringSimilarity,
  dateFormatter,
  messages,
} from "../../utils/index.js";
import { UserDto } from "../dtos/index.js";
import { MailService } from "./mail.service.js";
import { RoleService } from "./role.service.js";

export class UserService {
  static async create(createUserDto, tenantId) {
    const session = await startSession();
    session.startTransaction();

    try {
      await RoleService.get(createUserDto.role);

      const randomPassword = randomBytes(4).toString("hex");
      const user = await UserRepository.insert(
        { ...createUserDto, password: randomPassword, tenantId },
        session,
      );

      const { error } = await MailService.send({
        to: createUserDto.email,
        templateName: "new-user",
        context: {
          name: createUserDto.firstName,
          password: randomPassword,
        },
      });
      if (error) {
        throw new DependencyError("Error sending password to user email");
      }

      await session.commitTransaction();

      return {
        message: messages.COMMON.CREATED_Fn("User"),
        data: UserDto.from(user),
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

  static async get(id) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError(messages.ERROR.NOT_FOUND_Fn("User"));
    }

    return {
      message: messages.COMMON.FETCHED_Fn("User"),
      data: UserDto.from(user),
    };
  }

  /**
   * Updates a user's record
   * @param {string} id The user id.
   * @param {UserUpdate} updateUserDto
   * @param {object} [projection] The fields to include or exclude.
   * @returns
   */
  static async update(id, updateUserDto) {
    const user = await UserRepository.updateById(id, updateUserDto);
    if (!user) {
      throw new NotFoundError(messages.ERROR.NOT_FOUND_Fn("User"));
    }

    return {
      message: messages.COMMON.UPDATED_Fn("User"),
      data: UserDto.from(user),
    };
  }

  static async delete(id) {
    return UserRepository.deleteById(id);
  }

  static async changePassword(id, { currentPassword, newPassword }) {
    const user = await UserRepository.findById(id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      throw new ValidationError(messages.ERROR.VALIDATION, {
        password: "Incorrect Password",
      });

    const percentageSimilarity = calculatePercentageStringSimilarity(
      newPassword,
      currentPassword,
    );

    if (percentageSimilarity >= config.max_similarity) {
      throw new ValidationError(messages.ERROR.VALIDATION, {
        newPassword: "Password is too similar to old password.",
      });
    }

    await MailService.send({
      to: user.email,
      templateName: "password-change",
      context: {
        name: user.firstName,
        timestamp: dateFormatter.format(),
      },
    });

    user.set({ password: newPassword });
    await user.save();

    return {
      message: messages.USER.PASSWORD_CHANGE,
    };
  }

  static async resetPassword(id) {
    const randomPassword = randomBytes(4).toString("hex");
    const user = await UserRepository.updateById(id, {
      resetPassword: true,
      password: randomPassword,
    });

    await MailService.send({
      to: user.email,
      templateName: "password-reset",
      context: { name: user.firstName, password: randomPassword },
    });

    return {
      message: messages.USER.PASSWORD_RESET,
      data: {
        password: randomPassword,
      },
    };
  }

  static deactivateUser = async (userId) => {
    const [user] = await Promise.all([
      UserRepository.findById(userId),
      SessionRepository.deleteByUserId(userId),
    ]);

    if (!user) {
      throw new NotFoundError(messages.ERROR.NOT_FOUND_Fn("User"));
    }

    user.set({ status: USER_STATUS.DEACTIVATED });
    await user.save();

    // ? Should a notification email be sent to the user?

    return {
      message: messages.USER.DEACTIVATED,
    };
  };

  static reactivateUser = async (id) => {
    const user = await UserRepository.updateById(id, {
      status: USER_STATUS.ACTIVE,
    });
    if (!user) {
      throw new NotFoundError(messages.ERROR.NOT_FOUND_Fn("User"));
    }

    return {
      message: messages.USER.REACTIVATED,
    };
  };
}

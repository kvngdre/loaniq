import mongoose from "mongoose";

import { ConflictError, ValidationError } from "../../utils/errors/index.js";
import { messages } from "../../utils/messages.utils.js";
import { User } from "../models/index.js";
import { formatDuplicateError } from "./lib/get-duplicate-field.js";

export class UserRepository {
  static async find(filter = {}, sortOrder = { first_name: 1 }) {
    return User.find(filter).sort(sortOrder);
  }

  static async insert(userInfo, session) {
    try {
      const user = new User(userInfo);
      return user.save({ session });
    } catch (exception) {
      if (exception.message.includes("E11000")) {
        const field = formatDuplicateError(exception);
        throw new ConflictError(messages.ERROR.DUPLICATE_Fn(field));
      }

      if (exception instanceof mongoose.Error.ValidationError) {
        const msg = formatValidationError(exception);
        throw new ValidationError(msg);
      }

      throw exception;
    }
  }

  static async findById(id) {
    return User.findById(id);
  }

  static async findOne(filter) {
    return User.findOne(filter);
  }

  static async findByEmail(email) {
    return User.findOne({ email });
  }

  static async updateById(id, changes) {
    try {
      const foundUser = await User.findById(id);

      foundUser?.set(changes);
      await foundUser?.save();

      return foundUser;
    } catch (exception) {
      if (exception.message.includes("E11000")) {
        const field = formatDuplicateError(exception);
        throw new ConflictError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const error = formatValidationError(exception);
        throw new ValidationError(messages.ERROR.VALIDATION, error);
      }

      throw exception;
    }
  }

  static async updateOne(filter, changes) {
    try {
      return User.findOneAndUpdate(filter, changes, {
        new: true,
      });

      // foundUser.set(changes);
      // foundUser.save();
    } catch (exception) {
      if (exception.message.includes("E11000")) {
        const field = formatDuplicateError(exception);
        throw new ConflictError(`${field} already in use`);
      }

      if (exception instanceof Error.ValidationError) {
        const error = formatValidationError(exception);
        throw new ValidationError(messages.ERROR.VALIDATION, error);
      }

      throw exception;
    }
  }

  static async updateMany(filter, changes) {
    return User.updateMany(filter, changes);
  }

  static async deleteById(id) {
    return User.findByIdAndDelete(id);
  }
}

import mongoose from "mongoose";

import { ConflictError, ValidationError } from "../../utils/errors/index.js";
import { messages } from "../../utils/messages.utils.js";
import { User } from "../models/index.js";
import { getDuplicateField } from "./lib/get-duplicate-field.js";
import { getValidationErrorMessage } from "./lib/get-validation-error-message.js";

export class UserRepository {
  static async insert(createUserDto, session) {
    try {
      const user = new User(createUserDto);
      await user.save({ session });

      return user;
    } catch (exception) {
      if (exception.message.includes("E11000")) {
        const field = getDuplicateField(exception);
        throw new ConflictError(messages.ERROR.DUPLICATE_Fn(field));
      }

      if (exception instanceof mongoose.Error.ValidationError) {
        const msg = getValidationErrorMessage(exception);
        throw new ValidationError(msg);
      }

      throw exception;
    }
  }

  static async find(filter = {}, sortOrder = { first_name: 1 }) {
    return User.find(filter).sort(sortOrder);
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
      return await foundUser?.save();
    } catch (exception) {
      if (exception.message.includes("E11000")) {
        const field = getDuplicateField(exception);
        throw new ConflictError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errMsg = getValidationErrorMessage(exception);
        throw new ValidationError(errMsg);
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
        const field = getDuplicateField(exception);
        throw new ConflictError(`${field} already in use`);
      }

      if (exception instanceof Error.ValidationError) {
        const msg = getValidationErrorMessage(exception);
        throw new ValidationError(msg);
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

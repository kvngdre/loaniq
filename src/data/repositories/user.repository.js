import mongoose from "mongoose";

import { ConflictError, ValidationError } from "../../utils/errors/index.js";
import { messages } from "../../utils/messages.utils.js";
import dbContext from "../db-context.js";
import { getDuplicateField } from "./lib/get-duplicate-field.js";
import { getValidationErrorMessage } from "./lib/get-validation-error-message.js";

export class UserRepository {
  static async insert(createUserDto, session) {
    try {
      const user = new dbContext.User(createUserDto);
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

  static async find(
    filter = {},
    projection = {},
    sortOrder = { first_name: 1 },
  ) {
    return dbContext.User.find(filter).select(projection).sort(sortOrder);
  }

  static async findById(id, projection = {}) {
    return dbContext.User.findById(id).select(projection);
  }

  static async findOne(filter, projection = {}) {
    return dbContext.User.findOne(filter).select(projection);
  }

  static async findByEmail(email) {
    return dbContext.User.findOne({ email });
  }

  static async updateById(id, changes, projection = {}) {
    try {
      const foundUser = await dbContext.User.findById(id).select(projection);

      foundUser?.set(changes);
      foundUser?.save();

      return foundUser;
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
      return dbContext.User.findOneAndUpdate(filter, changes, {
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
    return dbContext.User.updateMany(filter, changes);
  }

  static async deleteById(id) {
    return dbContext.User.findByIdAndDelete(id);
  }
}

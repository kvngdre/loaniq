import mongoose from "mongoose";

import { ValidationError } from "../../utils/errors/index.js";
import dbContext from "../db-context.js";
import { getValidationErrorMessage } from "./lib/get-validation-error-message.js";

export class TokenRepository {
  static async insert(createTokenDto, session) {
    try {
      const token = new dbContext.Token(createTokenDto);
      return token.save({ session });
    } catch (exception) {
      if (exception instanceof mongoose.Error.ValidationError) {
        const msg = getValidationErrorMessage(exception);
        throw new ValidationError(msg);
      }

      throw exception;
    }
  }

  static async find(filter = {}) {
    return dbContext.Token.find(filter);
  }

  static async findById(id) {
    return dbContext.Token.findById(id);
  }

  static async findOne(filter) {
    return dbContext.Token.findOne(filter);
  }

  static async upsert(upsertTokenDto, session) {
    try {
      return dbContext.Token.findOneAndUpdate(
        { userId: upsertTokenDto.userId, type: upsertTokenDto.type },
        upsertTokenDto,
        { new: true, upsert: true, session },
      );
    } catch (exception) {
      if (exception instanceof mongoose.Error.ValidationError) {
        const errorMessage = getValidationErrorMessage(exception);
        throw new ValidationError(errorMessage);
      }

      throw exception;
    }
  }

  static async updateById(id, updateTokenDto) {
    try {
      return dbContext.Token.findByIdAndUpdate(id, updateTokenDto, {
        new: true,
      });
    } catch (exception) {
      if (exception instanceof mongoose.Error.ValidationError) {
        const errorMessage = getValidationErrorMessage(exception);
        throw new ValidationError(errorMessage);
      }

      throw exception;
    }
  }

  static async deleteById(id) {
    return dbContext.Token.findByIdAndDelete(id);
  }

  static async deleteOne(filter, session) {
    return dbContext.Token.findOneAndDelete(filter, { session });
  }
}

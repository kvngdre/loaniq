import mongoose from "mongoose";

import { ConflictError, ValidationError } from "../../utils/errors/index.js";
import { messages } from "../../utils/messages.utils.js";
import { Token } from "../models/index.js";
import { formatDuplicateFieldError } from "./lib/format-duplicate-field.js";
import { formatValidationError } from "./lib/format-validation-error.js";

export class TokenRepository {
  static async insert(createTokenDto, session) {
    try {
      const token = new Token(createTokenDto);
      return token.save({ session });
    } catch (exception) {
      if (exception instanceof mongoose.Error.ValidationError) {
        const msg = formatValidationError(exception);
        throw new ValidationError(msg);
      }

      throw exception;
    }
  }

  static async find(filter = {}) {
    return Token.find(filter);
  }

  static async findById(id) {
    return Token.findById(id);
  }

  static async findOne(filter) {
    return Token.findOne(filter);
  }

  static async upsert(upsertTokenDto, session) {
    try {
      return Token.findOneAndUpdate(
        { userId: upsertTokenDto.userId, type: upsertTokenDto.type },
        upsertTokenDto,
        { new: true, upsert: true, session },
      );
    } catch (exception) {
      if (exception.message.includes("E11000")) {
        const error = formatDuplicateFieldError(exception);
        throw new ConflictError(messages.ERROR.DUPLICATE, error);
      }

      if (exception instanceof Error.ValidationError) {
        const error = formatValidationError(exception);
        throw new ValidationError(messages.ERROR.VALIDATION, error);
      }

      throw exception;
    }
  }

  static async updateById(id, updateTokenDto) {
    try {
      return Token.findByIdAndUpdate(id, updateTokenDto, {
        new: true,
      });
    } catch (exception) {
      if (exception.message.includes("E11000")) {
        const error = formatDuplicateFieldError(exception);
        throw new ConflictError(messages.ERROR.DUPLICATE, error);
      }

      if (exception instanceof Error.ValidationError) {
        const error = formatValidationError(exception);
        throw new ValidationError(messages.ERROR.VALIDATION, error);
      }

      throw exception;
    }
  }

  static async deleteById(id) {
    return Token.findByIdAndDelete(id);
  }

  static async deleteOne(filter, session) {
    return Token.findOneAndDelete(filter, { session });
  }
}

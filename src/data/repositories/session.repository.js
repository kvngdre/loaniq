import mongoose from "mongoose";

import { ConflictError, ValidationError } from "../../utils/errors/index.js";
import { messages } from "../../utils/messages.utils.js";
import { Session } from "../models/index.js";
import { formatDuplicateFieldError } from "./lib/format-duplicate-field.js";
import { formatValidationError } from "./lib/format-validation-error.js";

export class SessionRepository {
  static async insert(createSessionDto, session) {
    try {
      const newSession = new Session(createSessionDto);
      await newSession.save({ session });

      return newSession;
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

  static async find(filter = {}, projection = {}) {
    return Session.find(filter).select(projection);
  }

  static async findById(id, projection = {}) {
    return Session.findById(id).select(projection);
  }

  static async findOne(filter) {
    return Session.findOne(filter);
  }

  static async findByToken(token) {
    return Session.findOne({ "sessions.refreshToken": token });
  }

  static async updateById(id, updateTokenDto) {
    try {
      return Session.findByIdAndUpdate(id, updateTokenDto, {
        new: true,
      });
    } catch (exception) {
      if (exception instanceof mongoose.Error.ValidationError) {
        const errorMessage = formatValidationError(exception);
        throw new ValidationError(errorMessage);
      }

      throw exception;
    }
  }

  static async upsert(upsertSessionDto, session = undefined) {
    try {
      return Session.findOneAndUpdate(
        { userId: upsertSessionDto.userId, type: upsertSessionDto.type },
        upsertSessionDto,
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

  static async deleteById(id) {
    return Session.findByIdAndDelete(id);
  }

  static async deleteByUserId(userId) {
    return Session.findOneAndDelete({ userId });
  }
}

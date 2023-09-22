import mongoose from "mongoose";

import { ValidationError } from "../../utils/errors/index.js";
import { Session } from "../models/index.js";
import { getValidationErrorMessage } from "./lib/get-validation-error-message.js";

export class SessionRepository {
  static async insert(createSessionDto, session) {
    try {
      const newSession = new Session(createSessionDto);
      await newSession.save({ session });

      return newSession;
    } catch (exception) {
      if (exception instanceof mongoose.Error.ValidationError) {
        const msg = getValidationErrorMessage(exception);
        throw new ValidationError(msg);
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
        const errorMessage = getValidationErrorMessage(exception);
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
      if (exception instanceof mongoose.Error.ValidationError) {
        const msg = getValidationErrorMessage(exception);
        throw new ValidationError(msg);
      }
      throw exception;
    }
  }

  static async deleteById(id) {
    return Session.findByIdAndDelete(id);
  }
}

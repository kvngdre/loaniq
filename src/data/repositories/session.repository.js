import mongoose from "mongoose";

import { NotFoundError, ValidationError } from "../../utils/errors/index.js";
import dbContext from "../db-context.js";
import { getValidationErrorMessage } from "./lib/get-validation-error-message.js";

export class SessionRepository {
  static async insert(createSessionDto, session) {
    try {
      const newSession = new dbContext.Session(createSessionDto);
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
    return dbContext.Session.find(filter).select(projection);
  }

  static async findById(id, projection = {}) {
    return dbContext.Session.findById(id).select(projection);
  }

  static async findOne(filter) {
    return dbContext.Session.findOne(filter);
  }

  static async findByToken(token) {
    return dbContext.Session.findOne({ "sessions.refreshToken": token });
  }

  static async upsert(upsertSessionDto, session) {
    try {
      return dbContext.Session.findOneAndUpdate(
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

  static async updateOne(id, updateTokenDto, projection = {}) {
    try {
      const foundToken = await dbContext.Session.findById(id).select(
        projection,
      );
      if (!foundToken) {
        throw new NotFoundError("Tenant not found");
      }

      foundToken.set(updateTokenDto);
      foundToken.save();

      return foundToken;
    } catch (exception) {
      if (exception instanceof mongoose.Error.ValidationError) {
        const errorMessage = getValidationErrorMessage(exception);
        throw new ValidationError(errorMessage);
      }

      throw exception;
    }
  }

  static async destroy(id) {
    return dbContext.Session.findByIdAndDelete(id);
  }
}

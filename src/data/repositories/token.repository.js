import mongoose from "mongoose";

import { NotFoundError, ValidationError } from "../../utils/errors/index.js";
import dbContext from "../db-context.js";
import { Token } from "../models/index.js";
import { getValidationErrorMessage } from "./lib/get-validation-error-message.js";

export class TokenRepository {
  static async save(createTokenDto, session) {
    try {
      const token = new Token(createTokenDto);
      await token.save({ session });

      return token;
    } catch (exception) {
      if (exception instanceof mongoose.Error.ValidationError) {
        const msg = getValidationErrorMessage(exception);
        throw new ValidationError(msg);
      }

      throw exception;
    }
  }

  static async find(filter = {}, projection = {}) {
    return Token.find(filter).select(projection);
  }

  static async findById(id, projection = {}) {
    return Token.findById(id).select(projection);
  }

  static async findOne(filter, projection = {}) {
    return Token.findOne(filter).select(projection);
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

  static async updateOne(id, updateTokenDto, projection = {}) {
    try {
      const foundToken = await Token.findById(id).select(projection);
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
    const foundToken = await Token.findById({ _id: id });
    if (!foundToken) {
      throw new NotFoundError("Token not found");
    }

    foundToken.delete();
  }
}

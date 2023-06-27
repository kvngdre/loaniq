import { NotFoundError, ValidationError } from "../errors/index.js";
import { Token } from "../models/index.js";
import { getValidationErrorMessage } from "./lib/get-validation-error-message.js";

export class TokenRepository {
  static async save(createTokenDto, session) {
    try {
      const token = new Token(createTokenDto);
      token.save({ session });

      return token;
    } catch (exception) {
      if (exception instanceof Error.ValidationError) {
        const errorMessage = getValidationErrorMessage(exception);
        throw new ValidationError(errorMessage);
      }

      throw exception;
    }
  }

  async find(filter = {}, projection = {}) {
    return Token.find(filter).select(projection);
  }

  async findById(id, projection = {}) {
    return Token.findById(id).select(projection);
  }

  async findOne(filter, projection = {}) {
    return Token.findOne(filter).select(projection);
  }

  async updateOne(id, updateTokenDto, projection = {}) {
    try {
      const foundToken = await Tenant.findById(id).select(projection);
      if (!foundToken) {
        throw new NotFoundError("Tenant not found");
      }

      foundToken.set(updateTokenDto);
      foundToken.save();

      return foundToken;
    } catch (exception) {
      if (exception instanceof Error.ValidationError) {
        const errorMessage = getValidationErrorMessage(exception);
        throw new ValidationError(errorMessage);
      }

      throw exception;
    }
  }

  async destroy(id) {
    const foundToken = await Token.findById({ _id: id });
    if (!foundToken) {
      throw new NotFoundError("Token not found");
    }

    foundToken.delete();
  }
}

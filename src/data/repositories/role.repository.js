import { Error } from "mongoose";

import { ConflictError, ValidationError } from "../../utils/errors/index.js";
import { messages } from "../../utils/messages.utils.js";
import { Role } from "../models/index.js";
import { formatDuplicateError } from "./lib/get-duplicate-field.js";
import { getValidationErrorMessage } from "./lib/get-validation-error-message.js";

export class RoleRepository {
  static async find(filter = {}) {
    return Role.find(filter);
  }

  static async insert(createRoleDto) {
    try {
      const role = new Role(createRoleDto);
      return await role.save();
    } catch (exception) {
      if (exception.message.includes("E11000")) {
        const field = formatDuplicateError(exception);
        throw new ConflictError(messages.ERROR.DUPLICATE_Fn(field));
      }

      if (exception instanceof Error.ValidationError) {
        const msg = getValidationErrorMessage(exception);
        throw new ValidationError(msg);
      }

      throw exception;
    }
  }

  static async findById(id) {
    return Role.findById(id);
  }

  static async findOne(filter) {
    return Role.findOne(filter);
  }

  static async updateById(id, changes) {
    try {
      const foundRole = await Role.findById(id);

      foundRole.set(changes);
      return await foundRole.save();
    } catch (exception) {
      if (exception.message.include("E11000")) {
        const field = formatDuplicateError(exception);
        throw new ConflictError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errorMessage = getValidationErrorMessage(exception);
        throw new ValidationError(errorMessage);
      }

      throw exception;
    }
  }

  static async deleteById(id) {
    return Role.findByIdAndDelete(id);
  }
}

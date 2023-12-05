import { Error } from "mongoose";

import { ConflictError, ValidationError } from "../../utils/errors/index.js";
import { messages } from "../../utils/messages.utils.js";
import { Role } from "../models/index.js";
import { formatDuplicateError } from "./lib/get-duplicate-field.js";

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
<<<<<<< HEAD
        const field = formatDuplicateError(exception);
        throw new ConflictError(messages.ERROR.DUPLICATE_Fn(field));
=======
        const error = formatDuplicateFieldError(exception);
        throw new ConflictError(messages.ERROR.DUPLICATE, error);
>>>>>>> 4c55c570b30ba875e6fb963936adfb5cbf181f96
      }

      if (exception instanceof Error.ValidationError) {
        const error = formatValidationError(exception);
        throw new ValidationError(messages.ERROR.VALIDATION, error);
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
<<<<<<< HEAD
      if (exception.message.include("E11000")) {
        const field = formatDuplicateError(exception);
        throw new ConflictError(`${field} already in use.`);
=======
      if (exception.message.includes("E11000")) {
        const error = formatDuplicateFieldError(exception);
        throw new ConflictError(messages.ERROR.DUPLICATE, error);
>>>>>>> 4c55c570b30ba875e6fb963936adfb5cbf181f96
      }

      if (exception instanceof Error.ValidationError) {
        const error = formatValidationError(exception);
        throw new ValidationError(messages.ERROR.VALIDATION, error);
      }

      throw exception;
    }
  }

  static async deleteById(id) {
    return Role.findByIdAndDelete(id);
  }
}

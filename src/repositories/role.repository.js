import { Error } from "mongoose";

import {
  ConflictError,
  NotFoundError,
  ValidationException,
} from "../errors/index.js";
import { Role } from "../models/role.model.js";
import { getDuplicateField } from "./lib/get-duplicate-field.js";
import { getValidationErrorMessage } from "./lib/get-validation-error-message.js";

class RoleRepository {
  async save(createRoleDto) {
    try {
      const role = new Role(createRoleDto);
      role.save();

      return role;
    } catch (exception) {
      if (exception.message.includes("E11000")) {
        const field = getDuplicateField(exception);
        throw new ConflictError(`${field} already un use.`);
      }

      if (exception instanceof Error.ValidationException) {
        const errorMessage = getValidationErrorMessage(exception);
        throw new ValidationException(errorMessage);
      }

      throw exception;
    }
  }

  async find(filter = {}, projection = {}) {
    return Role.find(filter).select(projection);
  }

  async findById(id, projection = {}) {
    return Role.findById(id).select(projection);
  }

  async findOne(filter, projection = {}) {
    return Role.findOne(filter).select(projection);
  }

  async update(id, updateRoleDto, projection = {}) {
    try {
      const foundRole = await Role.findById(id).select(projection);
      if (!foundRole) {
        throw new NotFoundError("Role not found");
      }

      foundRole.set(updateRoleDto);
      await foundRole.save();

      return foundRole;
    } catch (exception) {
      if (exception.message.include("E11000")) {
        const field = getDuplicateField(exception);
        throw new ConflictError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationException) {
        const errorMessage = getValidationErrorMessage(exception);
        throw new ValidationException(errorMessage);
      }

      throw exception;
    }
  }

  async remove(id) {
    Role.deleteOne({ _id: id });
  }
}

export const roleRepository = new RoleRepository();

import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../utils/errors/index.js";
import { messages } from "../../utils/messages.utils.js";
import { Tenant } from "../models/index.js";
import { formatDuplicateFieldError } from "./lib/format-duplicate-field.js";
import { formatValidationError } from "./lib/format-validation-error.js";

export class TenantRepository {
  static async insert(createTenantDto, session) {
    try {
      const tenant = new Tenant(createTenantDto);
      await tenant.save({ session });

      return tenant;
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
    return Tenant.find(filter).select(projection);
  }

  static async findById(id, projection = {}) {
    return Tenant.findById(id).select(projection);
  }

  static async findOne(filter, projection = {}) {
    return Tenant.findOne(filter).select(projection);
  }

  static async updateById(id, updateTenantDto) {
    try {
      const foundTenant = await Tenant.findById(id);

      foundTenant?.set(updateTenantDto);
      await foundTenant?.save();

      return foundTenant;
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
    const foundTenant = await Tenant.findById({ _id: id });
    if (!foundTenant) {
      throw new NotFoundError("Tenant not found");
    }

    foundTenant.delete();
  }
}

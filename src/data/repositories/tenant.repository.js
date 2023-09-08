import mongoose from "mongoose";

import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../utils/errors/index.js";
import dbContext from "../db-context.js";
import { getDuplicateField } from "./lib/get-duplicate-field.js";
import { getValidationErrorMessage } from "./lib/get-validation-error-message.js";

export class TenantRepository {
  static async save(createTenantDto, session) {
    try {
      const tenant = new dbContext.Tenant(createTenantDto);
      return tenant.save({ session });
    } catch (exception) {
      if (exception.message.includes("E11000")) {
        const field = getDuplicateField(exception);
        throw new ConflictError(`${field} already in use.`);
      }

      if (exception instanceof mongoose.Error.ValidationError) {
        const msg = getValidationErrorMessage(exception);
        throw new ValidationError(msg);
      }

      throw exception;
    }
  }

  static async find(filter = {}, projection = {}) {
    return dbContext.Tenant.find(filter).select(projection);
  }

  static async findById(id, projection = {}) {
    return dbContext.Tenant.findById(id).select(projection);
  }

  static async findOne(filter, projection = {}) {
    return dbContext.Tenant.findOne(filter).select(projection);
  }

  static async updateOne(id, updateTenantDto, projection = {}) {
    try {
      const foundTenant = await dbContext.Tenant.findById(id).select(
        projection,
      );
      if (!foundTenant) {
        throw new NotFoundError("Tenant not found");
      }

      foundTenant.set(updateTenantDto);
      foundTenant.save();

      return foundTenant;
    } catch (exception) {
      if (exception.message.includes("E11000")) {
        const field = getDuplicateField(exception);
        throw new ConflictError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errorMessage = getValidationErrorMessage(exception);
        throw new ValidationError(errorMessage);
      }

      throw exception;
    }
  }

  static async destroy(id) {
    const foundTenant = await dbContext.Tenant.findById({ _id: id });
    if (!foundTenant) {
      throw new NotFoundError("Tenant not found");
    }

    foundTenant.delete();
  }
}

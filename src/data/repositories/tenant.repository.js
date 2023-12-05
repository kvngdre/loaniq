import mongoose from "mongoose";

import { NotFoundError } from "../../utils/errors/index.js";
import { Tenant } from "../models/index.js";
import { BaseRepository } from "./base-repository.js";

export class TenantRepository extends BaseRepository {
  static async insert(entity, session) {
    try {
<<<<<<< HEAD
      const tenant = new Tenant(entity);
      return tenant.save({ session });
    } catch (error) {
      if (error.message.includes("E11000")) {
        this.handleDuplicateError(error);
      }

      if (error instanceof mongoose.Error.ValidationError) {
        this.handleValidationError(error);
=======
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
>>>>>>> 4c55c570b30ba875e6fb963936adfb5cbf181f96
      }

      throw error;
    }
  }

  static async find(filter = {}) {
    return Tenant.find(filter);
  }

  static async findById(id) {
    return Tenant.findById(id);
  }

  static async findOne(filter) {
    return Tenant.findOne(filter);
  }

<<<<<<< HEAD
  static async update(id, updateTenantDto) {
    try {
      const foundTenant = await Tenant.findById(id);
      if (!foundTenant) {
        throw new NotFoundError("Tenant not found");
      }
=======
  static async updateById(id, updateTenantDto) {
    try {
      const foundTenant = await Tenant.findById(id);
>>>>>>> 4c55c570b30ba875e6fb963936adfb5cbf181f96

      foundTenant?.set(updateTenantDto);
      await foundTenant?.save();

      return foundTenant;
<<<<<<< HEAD
    } catch (error) {
      if (error.message.includes("E11000")) {
        this.handleDuplicateError(error);
      }

      if (error instanceof mongoose.Error.ValidationError) {
        this.handleValidationError(error);
=======
    } catch (exception) {
      if (exception.message.includes("E11000")) {
        const error = formatDuplicateFieldError(exception);
        throw new ConflictError(messages.ERROR.DUPLICATE, error);
      }

      if (exception instanceof Error.ValidationError) {
        const error = formatValidationError(exception);
        throw new ValidationError(messages.ERROR.VALIDATION, error);
>>>>>>> 4c55c570b30ba875e6fb963936adfb5cbf181f96
      }

      throw error;
    }
  }

<<<<<<< HEAD
  static async delete(id) {
=======
  static async deleteById(id) {
>>>>>>> 4c55c570b30ba875e6fb963936adfb5cbf181f96
    const foundTenant = await Tenant.findById({ _id: id });
    if (!foundTenant) {
      throw new NotFoundError("Tenant not found");
    }

    foundTenant.delete();
  }
}

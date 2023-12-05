import mongoose from "mongoose";

import { NotFoundError } from "../../utils/errors/index.js";
import { Tenant } from "../models/index.js";
import { BaseRepository } from "./base-repository.js";

export class TenantRepository extends BaseRepository {
  static async insert(entity, session) {
    try {
      const tenant = new Tenant(entity);
      return tenant.save({ session });
    } catch (error) {
      if (error.message.includes("E11000")) {
        this.handleDuplicateError(error);
      }

      if (error instanceof mongoose.Error.ValidationError) {
        this.handleValidationError(error);
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

  static async update(id, updateTenantDto) {
    try {
      const foundTenant = await Tenant.findById(id);
      if (!foundTenant) {
        throw new NotFoundError("Tenant not found");
      }

      foundTenant.set(updateTenantDto);
      foundTenant.save();

      return foundTenant;
    } catch (error) {
      if (error.message.includes("E11000")) {
        this.handleDuplicateError(error);
      }

      if (error instanceof mongoose.Error.ValidationError) {
        this.handleValidationError(error);
      }

      throw error;
    }
  }

  static async delete(id) {
    const foundTenant = await Tenant.findById({ _id: id });
    if (!foundTenant) {
      throw new NotFoundError("Tenant not found");
    }

    foundTenant.delete();
  }
}

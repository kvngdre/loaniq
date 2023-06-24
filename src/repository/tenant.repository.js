import { Error } from 'mongoose';

import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../errors/index.js';
import { Tenant } from '../models/tenant.model.js';
import { BaseRepository } from './lib/base.repository.js';

export class TenantRepository extends BaseRepository {
  constructor() {
    super();
  }

  async save(createTenantDto, session) {
    try {
      const tenant = new Tenant(createTenantDto);
      tenant.save({ session });

      return tenant;
    } catch (exception) {
      if (exception.message.includes('E11000')) {
        const field = this.getDuplicateField(exception);
        throw new ConflictError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errorMessage = this.getValidationErrorMessage(exception);
        throw new ValidationError(errorMessage);
      }

      throw exception;
    }
  }

  async find(filter = {}, projection = {}) {
    return Tenant.find(filter).select(projection);
  }

  async findById(id, projection = {}) {
    return Tenant.findById(id).select(projection);
  }

  async findOne(filter, projection = {}) {
    return Tenant.findOne(filter).select(projection);
  }

  async updateOne(id, updateTenantDto, projection = {}) {
    try {
      const foundTenant = await Tenant.findById(id).select(projection);
      if (!foundTenant) {
        throw new NotFoundError('Tenant does not exist');
      }

      foundTenant.set(updateTenantDto);
      foundTenant.save();

      return foundTenant;
    } catch (exception) {
      if (exception.message.includes('E11000')) {
        const field = this.getDuplicateField(exception);
        throw new ConflictError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errorMessage = this.getValidationErrorMessage(exception);
        throw new ValidationError(errorMessage);
      }

      throw exception;
    }
  }

  async destroy(id) {
    return Tenant.deleteOne({ _id: id });
  }
}

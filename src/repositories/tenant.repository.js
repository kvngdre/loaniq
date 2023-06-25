import { Error } from 'mongoose';

import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../errors/index.js';
import { Tenant } from '../models/tenant.model.js';
import { getDuplicateField } from './lib/get-duplicate-field.js';
import { getValidationErrorMessage } from './lib/get-validation-error-message.js';

class TenantRepository {
  async save(createTenantDto, session) {
    try {
      const tenant = new Tenant(createTenantDto);
      tenant.save({ session });

      return tenant;
    } catch (exception) {
      if (exception.message.includes('E11000')) {
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
        throw new NotFoundError('Tenant not found');
      }

      foundTenant.set(updateTenantDto);
      foundTenant.save();

      return foundTenant;
    } catch (exception) {
      if (exception.message.includes('E11000')) {
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

  async destroy(id) {
    const foundTenant = await Tenant.findById({ _id: id });
    if (!foundTenant) {
      throw new NotFoundError('Tenant not found');
    }

    foundTenant.delete();
  }
}

export const tenantRepository = new TenantRepository();

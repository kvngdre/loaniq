import { Error } from 'mongoose';

import ConflictError from '../errors/ConflictError.js';
import ValidationError from '../errors/validation.error.js';
import Tenant from '../models/tenant.model.js';
import { BaseRepository } from './lib/base.repository.js';

class TenantRepository extends BaseRepository {
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
        const errMsg = this.getValidationErrorMsg(exception);
        throw new ValidationError(errMsg);
      }

      throw exception;
    }
  }

  async find(filter = {}, projection = {}) {
    const foundRecords = await Tenant.find(filter).select(projection);

    return foundRecords;
  }

  async findById(id, projection = {}) {
    const foundRecord = await Tenant.findById(id).select(projection);

    return foundRecord;
  }

  async findOne(filter, projection = {}) {
    const foundRecord = await Tenant.findOne(filter).select(projection);

    return foundRecord;
  }

  async update(id, dto, projection = {}) {
    try {
      const foundRecord = await Tenant.findById(id).select(projection);

      foundRecord.set(dto);
      await foundRecord.save();

      return foundRecord;
    } catch (exception) {
      if (exception.code === this.DUPLICATE_ERROR_CODE) {
        const field = this.getDuplicateField(exception);
        throw new ConflictError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errMsg = this.getValidationErrorMsg(exception);
        throw new ValidationError(errMsg);
      }

      throw exception;
    }
  }

  async remove(id) {
    const foundRecord = await Tenant.findByIdAndDelete(id);

    return foundRecord;
  }
}

export default TenantRepository;

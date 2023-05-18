import { Error } from 'mongoose';
import DuplicateError from '../errors/duplicate.error.js';
import ValidationError from '../errors/validation.error.js';
import TenantConfiguration from '../models/tenantConfiguration.model.js';
import BaseRepository from './base.repository.js';

class TenantConfigDAO extends BaseRepository {
  static async insert(newTenantConfigDTO, trx) {
    try {
      const newRecord = new TenantConfiguration(newTenantConfigDTO);
      await newRecord.save({ session: trx });

      return newRecord;
    } catch (exception) {
      if (exception.code === this.DUPLICATE_ERROR_CODE) {
        const field = this.getDuplicateField(exception);
        throw new DuplicateError(`${field} in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errMsg = this.getValidationErrorMsg(exception);
        throw new ValidationError(errMsg);
      }

      throw exception;
    }
  }

  static async find(filter = {}, projection = {}) {
    const foundRecords = await TenantConfiguration.find(filter).select(
      projection,
    );
    return foundRecords;
  }

  static async findOne(filter, projection = {}) {
    const foundRecord = await TenantConfiguration.findOne(filter)
      .select(projection)
      .populate('tenantId');
    return foundRecord;
  }

  static async update(filter, dto, projection = {}) {
    try {
      const foundRecord = await TenantConfiguration.findOneAndUpdate(
        filter,
        dto,
        {
          upsert: true,
          new: true,
        },
      ).select(projection);

      return foundRecord;
    } catch (exception) {
      if (exception.code === this.DUPLICATE_ERROR_CODE) {
        const field = this.getDuplicateField(exception);
        throw new DuplicateError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errMsg = this.getValidationErrorMsg(exception);
        throw new ValidationError(errMsg);
      }

      throw exception;
    }
  }

  static async remove(filter) {
    const deletedRecord = await TenantConfiguration.findOneAndDelete(filter);

    return deletedRecord;
  }
}

export default TenantConfigDAO;

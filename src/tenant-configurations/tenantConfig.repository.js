import { Error } from 'mongoose';
import DuplicateError from '../errors/duplicate.error.js';
import ValidationError from '../errors/validation.error.js';
import getDuplicateErrorField from '../utils/getDuplicateErrorField.js';
import getValidationErrorMessage from '../utils/getValidationErrorMessage.js';
import TenantConfiguration from './tenantConfig.model.js';

class TenantConfigurationRepository {
  async insert(newTenantConfigDTO, session) {
    try {
      const newRecord = new TenantConfiguration(newTenantConfigDTO);
      await newRecord.save({ session });

      return newRecord;
    } catch (exception) {
      if (exception.message.includes('E11000')) {
        throw new DuplicateError(
          `Operation failed, tenant configurations already exists.`,
        );
      }

      if (exception instanceof Error.ValidationError) {
        const errorMessage = getValidationErrorMessage(exception);
        throw new ValidationError(errorMessage);
      }

      throw exception;
    }
  }

  async find(filter = {}, projection = {}) {
    const foundRecords = await TenantConfiguration.find(filter).select(
      projection,
    );
    return foundRecords;
  }

  /**
   * Find document by the tenant object id
   * @param {string} tenantId
   * @param {*} projection
   * @returns
   */
  async findByTenantId(tenantId, projection = {}) {
    return await TenantConfiguration.findOne({ tenant: tenantId })
      .select(projection)
      .populate('tenantId');
  }

  async findOne(filter, projection = {}) {
    const foundRecord = await TenantConfiguration.findOne(filter)
      .select(projection)
      .populate('tenantId');
    return foundRecord;
  }

  async update(filter, dto, projection = {}) {
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

  async remove(filter) {
    const deletedRecord = await TenantConfiguration.findOneAndDelete(filter);

    return deletedRecord;
  }
}

export default TenantConfigurationRepository;

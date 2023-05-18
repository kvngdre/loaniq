import mongoose, { Error } from 'mongoose';
import DuplicateError from '../errors/duplicate.error.js';
import NotFoundError from '../errors/notFound.error.js';
import ValidationError from '../errors/validation.error.js';
import getDuplicateField from '../utils/getDuplicateErrorField.js';
import getValidationErrorMessage from '../utils/getValidationErrorMessage.js';
import Tenant from './tenant.model.js';

class TenantRepository {
  /**
   * Inserts a new tenant document into the database.
   * @param {import('./dto/new-tenant.dto.js').NewTenantDto} newTenantDto
   * @param {mongoose.ClientSession} session Mongo transaction session
   * @returns
   */
  async insert(newTenantDto, session) {
    try {
      const newRecord = new Tenant(newTenantDto);
      await newRecord.save({ session });

      return newRecord;
    } catch (exception) {
      // * Handling duplicate field error
      if (exception.message.includes('E11000')) {
        const field = getDuplicateField(exception);
        throw new DuplicateError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errorMessage = getValidationErrorMessage(exception);
        throw new ValidationError(errorMessage);
      }

      throw exception;
    }
  }

  async find(filter = {}, projection = {}) {
    return await Tenant.find(filter).select(projection);
  }

  async findById(id, projection = {}) {
    return await Tenant.findById(id).select(projection);
  }

  async findOne(filter, projection = {}) {
    return await Tenant.findOne(filter).select(projection);
  }

  async update(id, updateTenantDto, projection = {}) {
    try {
      const foundRecord = await Tenant.findById(id).select(projection);
      if (!foundRecord) {
        throw new NotFoundError('Update failed, tenant not found.');
      }

      foundRecord.set(updateTenantDto);
      await foundRecord.save();

      return foundRecord;
    } catch (exception) {
      if (exception.message.includes('E11000')) {
        const field = this.getDuplicateField(exception);
        throw new DuplicateError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errMsg = this.getValidationErrorMessage(exception);
        throw new ValidationError(errMsg);
      }

      throw exception;
    }
  }

  async remove(id) {
    return await Tenant.findByIdAndDelete(id);
  }
}

export default TenantRepository;

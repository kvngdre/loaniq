import mongoose, { Error } from 'mongoose';
import DuplicateError from '../errors/duplicate.error.js';
import NotFoundError from '../errors/notFound.error.js';
import ValidationError from '../errors/validation.error.js';
import getDuplicateFieldFromErrorMessage from '../utils/getDuplicateErrorField.js';
import getValidationErrorMessage from '../utils/getValidationErrorMessage.js';
import Tenant from './tenant.model.js';

class TenantRepository {
  /**
   * Inserts a new tenant document into the database.
   * @param {import('./dto/new-tenant.dto.js').NewTenantDto} newTenantDto
   * @param {mongoose.ClientSession} session Mongo transaction session
   * @returns {Promise<import('./jsdoc/Tenant.js').TenantDocument>}
   */
  async insert(newTenantDto, session) {
    try {
      const newRecord = new Tenant(newTenantDto);
      await newRecord.save({ session });

      return newRecord;
    } catch (exception) {
      // * Handling duplicate field error
      if (exception.message.includes('E11000')) {
        const field = getDuplicateFieldFromErrorMessage(exception);
        throw new DuplicateError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errorMessage = getValidationErrorMessage(exception);
        throw new ValidationError(errorMessage);
      }

      throw exception;
    }
  }

  /**
   * Returns all tenant documents or all documents that match filter if any.
   * @param {Partial<import('./jsdoc/Tenant.js').Tenant>} filter Tenant fields filter object
   * @param {Partial<import('./jsdoc/Tenant.js').Tenant>} projection Object containing field selection.
   * @returns {Promise<Array.<import('./jsdoc/Tenant.js').TenantDocument>}
   */
  async find(filter = {}, projection = {}) {
    return await Tenant.find(filter).select(projection);
  }

  /**
   * Finds and returns a tenant document by the object id.
   * @param {string} id Tenant object id
   * @param {Partial<import('./jsdoc/Tenant.js').Tenant>} projection Object containing field selection.
   * @returns {Promise<import('./jsdoc/Tenant.js').TenantDocument | null>}
   */
  async findById(id, projection = {}) {
    return await Tenant.findById(id).select(projection);
  }

  /**
   * Finds and returns a tenant document by fields.
   * @param {Partial<import('./jsdoc/Tenant.js').Tenant>} filter Tenant fields filter object
   * @param {Partial<import('./jsdoc/Tenant.js').Tenant>} projection Object containing field selection.
   * @returns {Promise<import('./jsdoc/Tenant.js').TenantDocument | null>}
   */
  async findOne(filter, projection = {}) {
    return await Tenant.findOne(filter).select(projection);
  }

  /**
   * Updates a tenant document if found.
   * @param {string} id The tenant object id
   * @param {Partial<import('./jsdoc/Tenant.js').Tenant>} updateTenantDto Tenant update object
   * @param {Partial<import('./jsdoc/Tenant.js').Tenant>} projection Object containing field selection.
   * @returns {Promise<import('./jsdoc/Tenant.js').TenantDocument>}
   * @throws {NotFoundError} If the tenant document is not found.
   */
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
        const errorMessage = this.getValidationErrorMessage(exception);
        throw new ValidationError(errorMessage);
      }

      throw exception;
    }
  }

  /**
   * Deletes a tenant by their object id.
   * @param {string} id Tenant object id
   * @returns {Promise<import('./jsdoc/Tenant.js').TenantDocument>}
   */
  async delete(id) {
    return await Tenant.findByIdAndDelete(id);
  }
}

export default TenantRepository;

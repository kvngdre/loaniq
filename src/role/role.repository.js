import { Error } from 'mongoose';
import DuplicateError from '../errors/duplicate.error.js';
import ValidationError from '../errors/validation.error.js';
import getDuplicateErrorField from '../utils/getDuplicateErrorField.js';
import getValidationErrorMessage from '../utils/getValidationErrorMessage.js';
import Role from './role.model.js';

class RoleRepository {
  async insert(dto) {
    try {
      const newReview = new Role(dto);
      await newReview.save();

      return newReview;
    } catch (exception) {
      if (exception.message.includes('E11000')) {
        throw new DuplicateError(`User role already exists`);
      }

      if (exception instanceof Error.ValidationError) {
        const errorMessage = getValidationErrorMessage(exception);
        throw new ValidationError(errorMessage);
      }

      throw exception;
    }
  }

  async find(filter = {}, projection = {}) {
    return await Role.find(filter).select(projection);
  }

  async findById(id, projection = {}) {
    const foundRecord = await Role.findById(id).select(projection);

    return foundRecord;
  }

  async findOne(filter, projection = {}) {
    return await Role.findOne(filter).select(projection);
  }

  async update(id, dto, projection = {}) {
    try {
      const foundRecord = await Role.findById(id).select(projection);

      foundRecord.set(dto);
      await foundRecord.save();

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

  async remove(id) {
    return await Role.findByIdAndDelete(id);
  }
}

export default RoleRepository;

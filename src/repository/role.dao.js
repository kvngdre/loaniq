import { Error } from 'mongoose';
import ConflictError from '../errors/ConflictError.js';
import ValidationError from '../errors/validation.error.js';
import Role from '../models/role.model.js';
import BaseRepository from './lib/base.repository.js';

class RoleDAO extends BaseRepository {
  static async insert(dto) {
    try {
      const newReview = new Role(dto);
      await newReview.save();

      return newReview;
    } catch (exception) {
      if (exception.code === this.DUPLICATE_ERROR_CODE) {
        const field = this.getDuplicateField(exception);
        throw new ConflictError(`${field} already un use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errMsg = this.getValidationErrorMsg(exception);
        throw new ValidationError(errMsg);
      }

      throw exception;
    }
  }

  static async find(filter = {}, projection = {}) {
    const foundRecords = await Role.find(filter).select(projection);

    return foundRecords;
  }

  static async findById(id, projection = {}) {
    const foundRecord = await Role.findById(id).select(projection);

    return foundRecord;
  }

  static async findOne(filter, projection = {}) {
    const foundRecord = await Role.findOne(filter).select(projection);

    return foundRecord;
  }

  static async update(id, dto, projection = {}) {
    try {
      const foundRecord = await Role.findById(id).select(projection);

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

  static async remove(id) {
    const deletedRecord = await Role.findByIdAndDelete(id);
    return deletedRecord;
  }
}

export default RoleDAO;

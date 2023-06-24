import { Error } from 'mongoose';
import ConflictError from '../errors/ConflictError.js';
import ValidationError from '../errors/validation.error.js';
import User from '../models/user.model.js';
import BaseRepository from './lib/base.repository.js';

class UserDAO extends BaseRepository {
  static async insert(dto, transactionSession) {
    try {
      const newRecord = new User(dto);
      await newRecord.save({ session: transactionSession });

      return newRecord;
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

  static async find(
    filter = {},
    projection = {},
    sortOrder = { first_name: 1 },
  ) {
    const foundRecords = await User.find(filter)
      .select(projection)
      .sort(sortOrder);

    return foundRecords;
  }

  static async findById(id, projection = {}) {
    const foundRecord = await User.findById(id)
      .select(projection)
      .populate({ path: 'role', select: '-tenantId' });

    return foundRecord;
  }

  static async findOne(filter, projection = {}) {
    const foundRecord = await User.findOne(filter)
      .select(projection)
      .populate({ path: 'role', select: '-tenantId' });

    return foundRecord;
  }

  static async update(filter, dto, projection = {}) {
    try {
      const foundRecord = await User.findOne(filter).select(projection);

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

  static async updateMany(filter, dto) {
    const result = await User.updateMany(filter, dto);

    return result;
  }

  static async remove(id) {
    const foundRecord = await User.findByIdAndDelete(id);

    return foundRecord;
  }
}

export default UserDAO;

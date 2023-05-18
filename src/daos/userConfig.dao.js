import { Error, Types } from 'mongoose';
import DuplicateError from '../errors/duplicate.error.js';
import ValidationError from '../errors/validation.error.js';
import UserConfiguration from '../models/user-config.model.js';
import BaseRepository from './base.repository.js';

class UserConfigDAO extends BaseRepository {
  static async insert(dto, trx) {
    try {
      const newRecord = new UserConfiguration(dto);
      await newRecord.save({ session: trx });

      return newRecord;
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

  static async find(filter = {}, projection = {}) {
    const foundRecords = await UserConfiguration.find(filter).select(
      projection,
    );

    return foundRecords;
  }

  // todo see if RBAC can narrow down so that we can do an upsert if not found
  static async findOne(filter, projection = {}) {
    const foundRecord = await UserConfiguration.findOne(filter).select(
      projection,
    );

    return foundRecord;
  }

  static async update(filter, dto, projection = {}) {
    try {
      const foundRecord = await UserConfiguration.findOneAndUpdate(
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
    filter = !Types.ObjectId.isValid(filter) ? filter : { _id: filter };
    const deletedRecord = await UserConfiguration.findOneAndDelete(filter);

    return deletedRecord;
  }
}

export default UserConfigDAO;

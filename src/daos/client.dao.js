import { Error } from 'mongoose';
import DuplicateError from '../errors/duplicate.error.js';
import ValidationError from '../errors/validation.error.js';
import Client from '../models/client.model.js';
import BaseDAO from './base.dao.js';

class ClientDAO extends BaseDAO {
  static async insert(dto, trx) {
    try {
      const newRecord = new Client(dto);
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

  static async find(
    filter = {},
    projection = {},
    sortOrder = { first_name: 1 },
  ) {
    const foundRecords = await Client.find(filter)
      .select(projection)
      .sort(sortOrder);

    return foundRecords;
  }

  static async findById(id, projection = {}) {
    const foundRecord = await Client.findById(id).select(projection);

    return foundRecord;
  }

  static async findOne(filter, projection = {}) {
    const foundRecord = await Client.findOne(filter).select(projection);

    return foundRecord;
  }

  static async update(id, dto, projection = {}) {
    try {
      const foundRecord = await Client.findById(id).select(projection);

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

  static async remove(id) {
    const deletedRecord = await Client.findByIdAndDelete(id);
    return deletedRecord;
  }
}

export default ClientDAO;

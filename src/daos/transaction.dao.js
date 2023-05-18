import { Error } from 'mongoose';
import BaseDAO from './base.dao.js';
import ConflictError from '../errors/ConflictError.js';
import Transaction from '../models/transaction.model.js';
import ValidationError from '../errors/ValidationError.js';

class TransactionDAO extends BaseDAO {
  static async insert(dto) {
    try {
      const newRecord = new Transaction(dto);
      await newRecord.save();

      return newRecord;
    } catch (exception) {
      if (exception.code === this.DUPLICATE_ERROR_CODE) {
        const field = this.getDuplicateField(exception);
        throw new ConflictError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const message = this.getValidationErrorMsg(exception);
        throw new ValidationError(message);
      }
    }
  }

  static async find(filter = {}, projection = {}) {
    const foundRecords = await Transaction.find(filter).select(projection);

    return foundRecords;
  }

  static async findById(id, projection = {}) {
    const foundRecord = await Transaction.findById(id).select(projection);

    return foundRecord;
  }

  static async findOne(filter, projection = {}) {
    const foundRecord = await Transaction.findOne(filter).select(projection);

    return foundRecord;
  }

  static async update(filter, dto, projection = {}) {
    try {
      const foundRecord = await Transaction.findOne(filter).select(projection);

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
    const deletedRecord = await Transaction.findByIdAndDelete(id);

    return deletedRecord;
  }
}

export default TransactionDAO;

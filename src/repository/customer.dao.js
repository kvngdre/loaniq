import { Error } from 'mongoose';
import BaseDAO from './base.dao.js';
import ConflictError from '../errors/ConflictError.js';
import Customer from '../models/customer.model.js';
import ValidationError from '../errors/ValidationError.js';

class CustomerDAO extends BaseDAO {
  static async insert(dto, trx) {
    try {
      const newRecord = new Customer(dto);
      await newRecord.save({ session: trx });

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

  static async find(filter = {}, projection = {}) {
    const foundRecords = await Customer.find(filter).select(projection);

    return foundRecords;
  }

  static async findById(id, projection = {}) {
    const foundRecord = await Customer.findById(id).select(projection);

    return foundRecord;
  }

  static async findOne(filter, projection = {}) {
    const foundRecord = await Customer.findOne(filter).select(projection);

    return foundRecord;
  }

  static async update(id, dto, projection = {}) {
    try {
      const foundRecord = await Customer.findById(id).select(projection);

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
    const deletedRecord = await Customer.findByIdAndDelete(id);

    return deletedRecord;
  }
}

export default CustomerDAO;

import { Error } from "mongoose";
import Permission from "../models/permission.model.js";
import ConflictError from "../utils/errors/ConflictError.js";
import ValidationError from "../utils/errors/ValidationError.js";
import BaseDAO from "./base.dao.js";

class PermissionDAO extends BaseDAO {
  static async insert(newRecordDTO) {
    try {
      const newRecord = new Permission(newRecordDTO);
      await newRecord.save();

      return newRecord;
    } catch (exception) {
      if (exception.code === this.DUPLICATE_ERROR_CODE) {
        const field = this.getDuplicateField(exception);
        throw new ConflictError(`Duplicate: ${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errMsg = this.getValidationErrorMsg(exception);
        throw new ValidationError(errMsg);
      }

      throw exception;
    }
  }

  static async find(filter = {}, projection = {}) {
    const foundRecords = await Permission.find(filter).select(projection);

    return foundRecords;
  }

  static async findById(id, projection = {}) {
    const foundRecord = await Permission.findById(id).select(projection);

    return foundRecord;
  }

  static async findOne(filter, projection = {}) {
    const foundRecord = await Permission.findOne(filter).select(projection);

    return foundRecord;
  }

  static async update(id, updateRecordDTO, projection = {}) {
    try {
      const foundRecord = await Permission.findById(id).select(projection);

      foundRecord.set(updateRecordDTO);
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
    const deletedRecord = await Permission.findByIdAndDelete(id);

    return deletedRecord;
  }
}

export default PermissionDAO;

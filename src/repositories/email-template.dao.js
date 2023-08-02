import { Error } from "mongoose";

import { ConflictError, ValidationException } from "../errors/index.js";
import EmailTemplate from "../models/email-template.model.js";
import { getDuplicateField } from "./lib/get-duplicate-field.js";
import { getValidationErrorMessage } from "./lib/get-validation-error-message.js";

class EmailTemplateDAO {
  static async insert(dto, trx) {
    try {
      const newRecord = new EmailTemplate(dto);
      await newRecord.save({ session: trx });

      return newRecord;
    } catch (exception) {
      if (exception.message.includes("E11000")) {
        const field = getDuplicateField(exception);
        throw new ConflictError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errMsg = getValidationErrorMessage(exception);
        throw new ValidationException(errMsg);
      }

      throw exception;
    }
  }

  static async find(filter = {}, projection = {}) {
    const foundRecords = await EmailTemplate.find(filter).select(projection);

    return foundRecords;
  }

  static async findById(id, projection = {}) {
    const foundRecord = await EmailTemplate.findById(id).select(projection);

    return foundRecord;
  }

  static async findOne(filter, projection = {}) {
    const foundRecord = await EmailTemplate.findOne(filter).select(projection);

    return foundRecord;
  }

  static async update(id, dto, projection = {}) {
    try {
      const foundRecord = await EmailTemplate.findById(id).select(projection);

      foundRecord.set(dto);
      await foundRecord.save();

      return foundRecord;
    } catch (exception) {
      if (exception.message.includes("E11000")) {
        const field = getDuplicateField(exception);
        throw new ConflictError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errMsg = getValidationErrorMessage(exception);
        throw new ValidationException(errMsg);
      }

      throw exception;
    }
  }

  static async remove(id) {
    const deletedRecord = await EmailTemplate.findByIdAndDelete(id);

    return deletedRecord;
  }
}

export default EmailTemplateDAO;

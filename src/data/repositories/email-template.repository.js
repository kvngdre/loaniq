import { Error } from "mongoose";

import { ConflictError, ValidationError } from "../../utils/errors/index.js";
import EmailTemplate from "../models/email-template.model.js";
import { formatDuplicateError } from "./lib/get-duplicate-field.js";

export class EmailTemplateRepository {
  static async find(filter = {}) {
    return EmailTemplate.find(filter);
  }

  static async insert(templateInfo, session) {
    try {
      const template = new EmailTemplate(templateInfo);
      await template.save({ session });

      return template;
    } catch (exception) {
      if (exception.message.includes("E11000")) {
<<<<<<< HEAD
        const field = formatDuplicateError(exception);
        throw new ConflictError(`${field} already in use.`);
=======
        const error = formatDuplicateFieldError(exception);
        throw new ConflictError(messages.ERROR.DUPLICATE, error);
>>>>>>> 4c55c570b30ba875e6fb963936adfb5cbf181f96
      }

      if (exception instanceof Error.ValidationError) {
        const error = formatValidationError(exception);
        throw new ValidationError(messages.ERROR.VALIDATION, error);
      }

      throw exception;
    }
  }

  static async findById(id) {
    return EmailTemplate.findById(id);
  }

  static async findOne(filter) {
    return EmailTemplate.findOne(filter);
  }

  static async updateById(id, changes) {
    try {
      return EmailTemplate.findByIdAndUpdate(id, changes, {
        new: true,
      });
    } catch (exception) {
      if (exception.message.includes("E11000")) {
<<<<<<< HEAD
        const field = formatDuplicateError(exception);
        throw new ConflictError(`${field} already in use.`);
=======
        const error = formatDuplicateFieldError(exception);
        throw new ConflictError(messages.ERROR.DUPLICATE, error);
>>>>>>> 4c55c570b30ba875e6fb963936adfb5cbf181f96
      }

      if (exception instanceof Error.ValidationError) {
        const error = formatValidationError(exception);
        throw new ValidationError(messages.ERROR.VALIDATION, error);
      }

      throw exception;
    }
  }

  static async deleteById(id) {
    return EmailTemplate.findByIdAndDelete(id);
  }
}

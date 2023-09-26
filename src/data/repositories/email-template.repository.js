import { Error } from "mongoose";

import { ConflictError, ValidationError } from "../../utils/errors/index.js";
import { messages } from "../../utils/messages.utils.js";
import { EmailTemplate } from "../models/index.js";
import { formatDuplicateFieldError } from "./lib/format-duplicate-field.js";
import { formatValidationError } from "./lib/format-validation-error.js";

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
        const error = formatDuplicateFieldError(exception);
        throw new ConflictError(messages.ERROR.DUPLICATE, error);
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
        const error = formatDuplicateFieldError(exception);
        throw new ConflictError(messages.ERROR.DUPLICATE, error);
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

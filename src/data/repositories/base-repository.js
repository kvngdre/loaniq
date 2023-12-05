import {
  DuplicateFieldError,
  ValidationError,
} from "../../utils/errors/index.js";
import { messages } from "../../utils/messages.utils.js";

export class BaseRepository {
  static handleDuplicateError(err) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field
      .charAt(0)
      .toUpperCase()
      .concat(field.slice(1))
      .replace(/([A-Z])/g, " $1")
      .trim()} is already in use`;
    const error = {
      [field]: message,
    };

    throw new ValidationError(messages.ERROR.VALIDATION, error);
  }

  static handleValidationError(err) {
    const field = Object.keys(err.errors)[0];
    const message = err.errors[field].message
      .replace("Path", "")
      .replace("`", "")
      .replace("`", "")
      .trim();

    const error = {
      message,
      path: field,
    };

    throw new DuplicateFieldError(error);
  }
}

import { messages } from "../messages.utils.js";
import { BaseError } from "./base-error.js";

export class DuplicateFieldError extends BaseError {
  constructor(
    error = undefined,
    message = messages.ERROR.DUPLICATE,
    innerException = undefined,
  ) {
    super(409, message, error, innerException);
  }
}

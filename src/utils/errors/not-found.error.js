import { BaseError } from "./base-error.js";

export class NotFoundError extends BaseError {
  constructor(message, errors = undefined, innerException = undefined) {
    super(404, message, errors, innerException);
  }
}

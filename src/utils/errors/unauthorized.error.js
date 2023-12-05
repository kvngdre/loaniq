import { BaseError } from "./base-error.js";

export class UnauthorizedError extends BaseError {
  constructor(message, errors = undefined, innerException = undefined) {
    super(401, message, errors, innerException);
  }
}

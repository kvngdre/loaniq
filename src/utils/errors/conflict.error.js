import { BaseError } from "./base-error.js";

export class ConflictError extends BaseError {
  constructor(
    message,
    errors = { path: [], innerException: undefined },
    innerException = undefined,
  ) {
    super(409, message, errors, innerException);
  }
}

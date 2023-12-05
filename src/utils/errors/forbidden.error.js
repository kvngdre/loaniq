import { BaseError } from "./base-error.js";

export class ForbiddenError extends BaseError {
  constructor(
    message,
    errors = { path: [], innerException: undefined },
    innerException = undefined,
  ) {
    super(403, message, errors, innerException);
  }
}

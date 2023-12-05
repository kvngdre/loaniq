import { BaseError } from "./base-error.js";

export class DependencyError extends BaseError {
  constructor(
    message,
    errors = { path: [], innerException: undefined },
    innerException = undefined,
  ) {
    super(424, message, errors, innerException);
  }
}

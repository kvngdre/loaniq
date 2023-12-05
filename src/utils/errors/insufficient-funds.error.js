import { BaseError } from "./base-error.js";

export class InsufficientFundsError extends BaseError {
  constructor(
    message,
    errors = { path: [], innerException: undefined },
    innerException = undefined,
  ) {
    super(402, true, message, errors, innerException);
  }
}

import { BaseError } from "./lib/base-error.js";

export class InsufficientFundsError extends BaseError {
  constructor(message, errors = undefined) {
    super(402, true, message, errors);
  }
}

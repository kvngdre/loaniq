import { BaseError } from "./lib/base-error.js";

export class UnauthorizedError extends BaseError {
  constructor(message, errors = undefined) {
    super(true, message, errors);
  }
}

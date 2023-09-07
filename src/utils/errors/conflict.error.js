import { BaseError } from "./lib/base-error.js";

export class ConflictError extends BaseError {
  constructor(message, errors = undefined) {
    super(409, true, message, errors);
  }
}

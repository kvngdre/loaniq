import { BaseError } from "./lib/base-error.js";

export class ValidationError extends BaseError {
  constructor(message, errors = undefined) {
    super(400, true, message, errors);
  }
}

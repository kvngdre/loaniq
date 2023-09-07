import { BaseError } from "./lib/base-error.js";

export class NotFoundError extends BaseError {
  constructor(message, errors = undefined) {
    super(404, true, message, errors);
  }
}

import { BaseError } from "./lib/base-error.js";

export class DependencyError extends BaseError {
  constructor(message, errors = undefined) {
    super(424, true, message, errors);
  }
}

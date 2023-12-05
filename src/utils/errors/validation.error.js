import { BaseError } from "./base-error.js";

export class ValidationError extends BaseError {
  /**
   *
   * @param {string} message
   * @param {Record<string, *>} context
   * @param {Error} innerException
   */
  constructor(message, context = undefined, innerException = undefined) {
    super(400, message, context, innerException);
  }
}

import { BaseError } from "./base-error.js";

export class ServerError extends BaseError {
  /**
   * This exception class can be used to represent unexpected server-side errors or exceptions that occur during the execution of a request or operation.
   * This exception is commonly used to handle scenarios where an internal error or exception arises, such as database failures, network issues, calling third party apis,
   * or other unforeseen circumstances, and would like to return a custom message and/or errors.
   * @param {string} message - The custom error message associated with the exception.
   * @param {{ [key: string]: * }} [errors] - An optional dictionary of additional error details.
   * @param {Error} [innerException] - An optional inner exception that caused the server error.
   */
  constructor(
    message,
    errors = { path: [], innerException: undefined },
    innerException = undefined,
  ) {
    super(500, message, errors, innerException);
  }
}

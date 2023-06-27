/**
 * @typedef ErrorResponseArgs
 * @type {Object}
 * @property {string} name name/type of error
 * @property {(object|string)} [errors] The error message(s).
 * @property {object} [data] Data if necessary to be appended to error object.
 */

class ErrorResponse {
  /**
   *
   * @param {ErrorResponseArgs} args
   */
  constructor(args) {
    this.success = false;
    this.errors = args?.errors ? { ...args.errors } : { message: args.message };
    this.data = args?.data;
  }
}

export default ErrorResponse;

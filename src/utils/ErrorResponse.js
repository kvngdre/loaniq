/**
 * @typedef ErrorResponseArgs
 * @type {Object}
 * @property {string} message error message
 * @property {Object} [errors]
 * @property {*} [data] error data
 */

class ErrorResponse {
  /**
   *
   * @param {ErrorResponseArgs} args
   */
  constructor(args) {
    this.success = false;
    this.message = args.message || 'Something went wrong';
    this.errors = args?.errors ? { ...args.errors } : undefined;
    this.data = args?.data;
  }
}

export default ErrorResponse;

import { HttpCode } from '../utils/HttpCode.js';
import APIError from './api.error.js';

class ValidationError extends APIError {
  /**
   *
   * @param {string} message Error message
   * @param {Object} errors Validation errors object
   * @param {*} data
   */
  constructor(message, errors = undefined, data = undefined) {
    super(HttpCode.BAD_REQUEST, true, message, data);
    this.errors = errors;
  }
}

export default ValidationError;

import { HttpCode } from '../utils/HttpCode.js';
import APIError from './api.error.js';

class DuplicateError extends APIError {
  /**
   *
   * @param {string} message Error message
   * @param {*} data
   */
  constructor(message, data = undefined) {
    super(HttpCode.CONFLICT, true, message, data);
  }
}

export default DuplicateError;

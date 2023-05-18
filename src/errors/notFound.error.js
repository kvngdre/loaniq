import { HttpCode } from '../utils/HttpCode.js';
import APIError from './api.error.js';

class NotFoundError extends APIError {
  /**
   *
   * @param {string} message Error message
   * @param {*} data
   */
  constructor(message, data = undefined) {
    super(HttpCode.NOT_FOUND, true, message, data);
  }
}

export default NotFoundError;

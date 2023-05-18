import { HttpCodes } from '../utils/HttpCodes.js';
import APIError from './api.error.js';

class NotFoundError extends APIError {
  constructor(message, data = undefined) {
    super(HttpCodes.NOT_FOUND, true, message, data);
  }
}

export default NotFoundError;

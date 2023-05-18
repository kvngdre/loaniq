import { HttpCodes } from '../utils/HttpCodes.js';
import APIError from './api.error.js';

class UnauthorizedError extends APIError {
  constructor(message, data = undefined) {
    super(HttpCodes.UNAUTHORIZED, true, message, data);
  }
}

export default UnauthorizedError;

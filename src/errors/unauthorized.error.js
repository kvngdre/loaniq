import { HttpCode } from '../utils/HttpCode.js';
import APIError from './api.error.js';

class UnauthorizedError extends APIError {
  constructor(message, data = undefined) {
    super(HttpCode.UNAUTHORIZED, true, message, data);
  }
}

export default UnauthorizedError;

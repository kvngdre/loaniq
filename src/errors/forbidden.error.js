import { HttpCode } from '../utils/HttpCode.js';
import APIError from './api.error.js';

class ForbiddenError extends APIError {
  constructor(message, data = undefined) {
    super(HttpCode.FORBIDDEN, true, message, data);
  }
}

export default ForbiddenError;

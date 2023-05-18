import { HttpCodes } from '../utils/HttpCodes.js';
import APIError from './api.error.js';

class ForbiddenError extends APIError {
  constructor(message, data = undefined) {
    super(HttpCodes.FORBIDDEN, true, message, data);
  }
}

export default ForbiddenError;

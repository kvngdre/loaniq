import { HttpCodes } from '../utils/HttpCodes.js';
import APIError from './api.error.js';

class UnauthorizedError extends APIError {
  constructor(message, description = undefined, data = undefined) {
    const httpCode = HttpCodes.UNAUTHORIZED;
    const isOperational = true;

    super(httpCode, isOperational, message, description, data);
  }
}

export default UnauthorizedError;

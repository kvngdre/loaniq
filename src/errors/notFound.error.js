import { HttpCodes } from '../utils/HttpCodes.js';
import APIError from './api.error.js';

class NotFoundError extends APIError {
  constructor(description) {
    const name = 'Not Found Error';
    const httpCode = HttpCodes.NOT_FOUND;
    const isOperational = true;

    super(name, httpCode, isOperational, description);
  }
}

export default NotFoundError;

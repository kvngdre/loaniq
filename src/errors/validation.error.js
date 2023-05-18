import { HttpCodes } from '../utils/HttpCodes.js';
import APIError from './api.error.js';

class ValidationError extends APIError {
  constructor(description, errors = undefined) {
    const name = 'Validation Error';
    const httpCode = HttpCodes.BAD_REQUEST;
    const isOperational = true;

    super(name, httpCode, isOperational, description);
    this.errors = errors;
  }
}

export default ValidationError;

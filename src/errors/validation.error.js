import { HttpCodes } from '../utils/HttpCodes.js';
import APIError from './api.error.js';

class ValidationError extends APIError {
  constructor(message, errors = undefined, data = undefined) {
    super(HttpCodes.BAD_REQUEST, true, message, data);
    this.errors = errors;
  }
}

export default ValidationError;

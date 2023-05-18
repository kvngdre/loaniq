import { HttpCodes } from '../utils/HttpCodes.js';
import APIError from './api.error.js';

class DuplicateError extends APIError {
  constructor(message, data = undefined) {
    super(HttpCodes.CONFLICT, true, message, data);
  }
}

export default DuplicateError;

import { HttpCodes } from '../utils/HttpCodes.js';
import APIError from './api.error.js';

class DuplicateError extends APIError {
  constructor(description) {
    super(HttpCodes.CONFLICT, true, description);
  }
}

export default DuplicateError;

import { httpCodes } from '../utils/common.js';
import BaseError from './BaseError.js';

class ForbiddenError extends BaseError {
  constructor(description, data) {
    const name = 'Auth Error';
    const httpCode = httpCodes.FORBIDDEN;
    const isOperational = true;

    super(name, httpCode, isOperational, description, data);
  }
}

export default ForbiddenError;

import { httpCodes } from '../utils/common.js';
import { BaseError } from './BaseError.js';

export class ForbiddenError extends BaseError {
  constructor(description, data) {
    const httpCode = httpCodes.FORBIDDEN;
    const isOperational = true;

    super(httpCode, isOperational, description, data);
  }
}

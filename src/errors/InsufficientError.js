import { httpCodes } from '../utils/common.js';
import { BaseError } from './BaseError.js';

export class InsufficientError extends BaseError {
  constructor(description, data) {
    const httpCode = httpCodes.PAYMENT_REQUIRED;
    const isOperational = true;

    super(httpCode, isOperational, description, data);
  }
}

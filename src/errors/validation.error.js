import { HttpCode } from '../utils/common.js';
import { BaseError } from './lib/base-error.js';

export class ValidationError extends BaseError {
  constructor(description, errors = undefined) {
    const httpCode = HttpCode.BAD_REQUEST;
    const isOperational = true;

    super(httpCode, isOperational, description);
    this.errors = errors;
  }
}

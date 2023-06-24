import { HttpCode } from '../utils/common.js';
import { BaseError } from './lib/base-error.js';

export class UnauthorizedError extends BaseError {
  constructor(description) {
    const httpCode = HttpCode.UNAUTHORIZED;
    const isOperational = true;

    super(httpCode, isOperational, description);
  }
}

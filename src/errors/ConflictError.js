import { HttpCode } from '../utils/common.js';
import { BaseError } from './lib/base-error.js';

export class ConflictError extends BaseError {
  constructor(description) {
    const httpCode = HttpCode.CONFLICT;
    const isOperational = true;

    super(httpCode, isOperational, description);
  }
}

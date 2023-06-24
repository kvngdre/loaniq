import { HttpCode } from '../utils/common.js';
import { BaseError } from './lib/base-error.js';

export class NotFoundError extends BaseError {
  constructor(description) {
    const httpCode = HttpCode.NOT_FOUND;
    const isOperational = true;

    super(httpCode, isOperational, description);
  }
}

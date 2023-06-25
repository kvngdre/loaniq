import { HttpCode } from '../utils/common.js';
import { BaseError } from './lib/base-error.js';

export class ForbiddenError extends BaseError {
  constructor(description, data) {
    const httpCode = HttpCode.FORBIDDEN;
    const isOperational = true;

    super(httpCode, isOperational, description, data);
  }
}

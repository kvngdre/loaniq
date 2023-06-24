import { HttpCode } from '../utils/common.js';
import { BaseError } from './lib/base-error.js';

export class DependencyError extends BaseError {
  constructor(description) {
    const httpCode = HttpCode.DEPENDENCY;
    const isOperational = true;

    super(httpCode, isOperational, description);
  }
}

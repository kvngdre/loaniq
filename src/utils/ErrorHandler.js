import { BaseError } from '../errors/lib/base-error.js';
import logger from './logger.js';

class ErrorHandler {
  static isTrustedError(error) {
    if (error instanceof BaseError) return true;

    return false;
  }

  static handleError(error) {
    if (this.isTrustedError(error)) {
      logger.error(error.message, error.stack);
    } else {
      // todo should send an email to super admin on fatal error.
      logger.fatal(error.message, error.stack);
    }
  }
}

export default ErrorHandler;

import APIError from '../errors/api.error.js';
import logger from './logger.js';

class ErrorHandler {
  isTrustedError(error) {
    if (error instanceof APIError) return true;
    return false;
  }

  handleError(error) {
    if (this.isTrustedError(error)) {
      if (error.isOperational) logger.debug(error.message);
      logger.error(error.message, error.stack);
    } else {
      // TODO: should send an email to super admin on fatal error?
      logger.fatal(error.message, error.stack);
    }
  }
}

export default new ErrorHandler();

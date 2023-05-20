import APIError from '../errors/api.error.js';
import logger from './logger.js';

class ErrorHandler {
  isTrustedError(error) {
    if (error instanceof APIError) return true;
    return false;
  }

  handleError(error) {
    if (this.isTrustedError(error)) {
      this.#handleTrustedError(error);
    } else {
      // TODO: should send an email to super admin on untrusted error?
      this.#handleUntrustedError(error);
    }
  }

  #handleTrustedError(error) {
    if (error.isOperational) return logger.debug(error.message, error.stack);

    return logger.error(error.message, error.stack);
  }

  #handleUntrustedError(error) {
    return logger.fatal(error.message, error.stack);
  }
}

export default new ErrorHandler();

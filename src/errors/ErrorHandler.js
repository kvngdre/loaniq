import BaseError from './BaseError'
// const logger = require('../utils/logger')('errorHandler');

class ErrorHandler {
  static isTrustedError (err) {
    if (err instanceof BaseError) return true

    return false
  }

  static handleError (err) {
    // logger.error({message: err.message, meta: err.stack});

  }
}

export default ErrorHandler

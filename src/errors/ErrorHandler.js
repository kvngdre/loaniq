import BaseError from './BaseError'
import logger from '../utils/logger'

class ErrorHandler {
  static isTrustedError (error) {
    if (error instanceof BaseError) return true

    return false
  }

  static handleError (error) {
    if (this.isTrustedError(error)) {
      logger.error(error.message, error.stack)
    } else {
      logger.fatal(error.message, error.stack)
    }
  }
}

export default ErrorHandler

import { httpCodes } from '../utils/common.js'
import BaseError from './BaseError.js'

class NotFoundError extends BaseError {
  constructor(description) {
    const name = 'Not Found Error'
    const httpCode = httpCodes.NOT_FOUND
    const isOperational = true

    super(name, httpCode, isOperational, description)
  }
}

export default NotFoundError

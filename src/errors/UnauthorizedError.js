import { httpCodes } from '../utils/common.js'
import BaseError from './BaseError.js'

class UnauthorizedError extends BaseError {
  constructor(description) {
    const name = 'Auth Error'
    const httpCode = httpCodes.UNAUTHORIZED
    const isOperational = true

    super(name, httpCode, isOperational, description)
  }
}

export default UnauthorizedError

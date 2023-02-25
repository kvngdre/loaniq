import { httpCodes } from '../utils/constants'
import BaseError from './BaseError'

class UnauthorizedError extends BaseError {
  constructor (description) {
    const httpCode = httpCodes.UNAUTHORIZED
    const isOperational = true

    super(httpCode, isOperational, description)
  }
}

export default UnauthorizedError

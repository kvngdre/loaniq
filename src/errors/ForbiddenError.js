import { httpCodes } from '../utils/constants'
import BaseError from './BaseError'

class ForbiddenError extends BaseError {
  constructor (description) {
    const httpCode = httpCodes.FORBIDDEN
    const isOperational = true

    super(httpCode, isOperational, description)
  }
}

export default ForbiddenError

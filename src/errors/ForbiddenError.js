import { httpCodes } from '../utils/constants'
import BaseError from './BaseError'

class ForbiddenError extends BaseError {
  constructor (description) {
    const name = 'Forbidden Error'
    const httpCode = httpCodes.FORBIDDEN
    const isOperational = true

    super(name, httpCode, isOperational, description)
  }
}

export default ForbiddenError

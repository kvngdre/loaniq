import { httpCodes } from '../utils/constants'
import BaseError from './BaseError'

class ConflictError extends BaseError {
  constructor (description) {
    const httpCode = httpCodes.CONFLICT
    const isOperational = true

    super(httpCode, isOperational, description)
  }
}

export default ConflictError

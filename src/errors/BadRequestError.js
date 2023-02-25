import { httpCodes } from '../utils/constants'
import BaseError from './BaseError'

class BadRequestError extends BaseError {
  constructor (description) {
    const httpCode = httpCodes.BAD_REQUEST
    const isOperational = true

    super(httpCode, isOperational, description)
  }
}

export default BadRequestError

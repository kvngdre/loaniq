import { httpCodes } from '../utils/constants'
import BaseError from './BaseError'

class NotFoundError extends BaseError {
  constructor (description) {
    const httpCode = httpCodes.NOT_FOUND
    const isOperational = true

    super(httpCode, isOperational, description)
  }
}

export default NotFoundError

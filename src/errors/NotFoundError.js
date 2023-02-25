import { httpCodes } from '../utils/constants'
import BaseError from './BaseError'

class NotFoundError extends BaseError {
  constructor (description) {
    const name = 'Not Found Error'
    const httpCode = httpCodes.NOT_FOUND
    const isOperational = true

    super(name, httpCode, isOperational, description)
  }
}

export default NotFoundError

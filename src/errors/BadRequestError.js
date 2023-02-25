import { httpCodes } from '../utils/constants'
import BaseError from './BaseError'

class BadRequestError extends BaseError {
  constructor (description) {
    const name = 'Bad Request Error'
    const httpCode = httpCodes.BAD_REQUEST
    const isOperational = true

    super(name, httpCode, isOperational, description)
  }
}

export default BadRequestError

import { httpCodes } from '../utils/constants'
import BaseError from './BaseError'

class UnauthorizedError extends BaseError {
  constructor (description) {
    const name = 'Unauthorized Error'
    const httpCode = httpCodes.UNAUTHORIZED
    const isOperational = true

    super(name, httpCode, isOperational, description)
  }
}

export default UnauthorizedError

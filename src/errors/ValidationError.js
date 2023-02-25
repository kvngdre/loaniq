import { httpCodes } from '../utils/constants'
import BaseError from './BaseError'

class ValidationError extends BaseError {
  constructor (description, path = undefined) {
    const name = 'Validation Error'
    const httpCode = httpCodes.BAD_REQUEST
    const isOperational = true

    super(name, httpCode, isOperational, description)
    this.path = path
  }
}

export default ValidationError

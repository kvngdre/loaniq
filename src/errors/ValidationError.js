import { httpCodes } from '../utils/common.js'
import BaseError from './BaseError.js'

class ValidationError extends BaseError {
  constructor(description, errors = undefined) {
    const name = 'Validation Error'
    const httpCode = httpCodes.BAD_REQUEST
    const isOperational = true

    super(name, httpCode, isOperational, description)
    this.errors = errors
  }
}

export default ValidationError

import { httpCodes } from '../utils/constants'
import BaseError from './BaseError'

class ConflictError extends BaseError {
  constructor (description, name = 'Conflict Error') {
    const httpCode = httpCodes.CONFLICT
    const isOperational = true

    super(name, httpCode, isOperational, description)
  }
}

export default ConflictError

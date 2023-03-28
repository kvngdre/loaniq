import { httpCodes } from '../utils/common'
import BaseError from './BaseError'

class ConflictError extends BaseError {
  constructor (description) {
    const name = 'Duplex Error'
    const httpCode = httpCodes.CONFLICT
    const isOperational = true

    super(name, httpCode, isOperational, description)
  }
}

export default ConflictError

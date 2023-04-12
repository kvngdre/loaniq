import { httpCodes } from '../utils/common.js'
import BaseError from './BaseError.js'

class InsufficientError extends BaseError {
  constructor(description, data) {
    const name = 'Insufficient Funds Error'
    const httpCode = httpCodes.PAYMENT_REQUIRED
    const isOperational = true

    super(name, httpCode, isOperational, description, data)
  }
}

export default InsufficientError

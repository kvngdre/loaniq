import { httpCodes } from '../utils/constants'
import BaseError from './BaseError'

class InsufficientError extends BaseError {
  constructor (description, data) {
    const name = 'Insufficient Funds Error'
    const httpCode = httpCodes.PAYMENT_REQUIRED
    const isOperational = true

    super(name, httpCode, isOperational, description, data)
  }
}

export default InsufficientError

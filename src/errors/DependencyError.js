import { httpCodes } from '../utils/constants'
import BaseError from './BaseError'

class DependencyError extends BaseError {
  constructor (description) {
    const httpCode = httpCodes.DEPENDENCY
    const isOperational = true

    super(httpCode, isOperational, description)
  }
}

export default DependencyError

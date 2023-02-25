import { httpCodes } from '../utils/constants'
import BaseError from './BaseError'

class DependencyError extends BaseError {
  constructor (description) {
    const name = 'Dependency Error'
    const httpCode = httpCodes.DEPENDENCY
    const isOperational = true

    super(name, httpCode, isOperational, description)
  }
}

export default DependencyError

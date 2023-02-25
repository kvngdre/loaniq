class BaseError extends Error {
  constructor (name, httpCode, isOperational, description) {
    super(description)
    Object.setPrototypeOf(this, new.target.prototype)

    this.name = name
    this.code = httpCode
    this.isOperational = isOperational

    Error?.captureStackTrace(this, this.constructor)
  }
}

export default BaseError

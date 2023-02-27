class BaseError extends Error {
  constructor (name, httpCode, isOperational, description, data = undefined) {
    super(description)
    Object.setPrototypeOf(this, new.target.prototype)

    this.name = name
    this.code = httpCode
    this.isOperational = isOperational
    this.data = data

    Error?.captureStackTrace(this, this.constructor)
  }
}

export default BaseError

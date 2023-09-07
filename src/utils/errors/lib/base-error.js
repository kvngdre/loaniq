export class BaseError extends Error {
  constructor(httpCode, isOperational, description, errors) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.code = httpCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Error?.captureStackTrace(this, this.constructor);
  }
}

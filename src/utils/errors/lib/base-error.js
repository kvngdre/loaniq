export class BaseError extends Error {
  constructor(isOperational, description, errors) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.isOperational = isOperational;
    this.errors = errors;

    Error?.captureStackTrace(this, this.constructor);
  }
}

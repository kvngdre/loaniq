export class BaseError extends Error {
  constructor(httpCode, isOperational, description, data = undefined) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.code = httpCode;
    this.isOperational = isOperational;
    this.data = data;

    Error?.captureStackTrace(this, this.constructor);
  }
}

export class BaseError extends Error {
  /**
   *
   * @param {number} statusCode
   * @param {string} message
   * @param {{path: (Array<string>|string), message: string}[]} context
   * @param {Error} innerException
   */
  constructor(statusCode, message, context, innerException = undefined) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.context = context;
    this.innerException = innerException;

    Error?.captureStackTrace(this, this.constructor);
  }
}

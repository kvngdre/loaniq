import { HttpCode } from "../utils/common.js";
import { BaseError } from "./lib/base-error.js";

export class InsufficientError extends BaseError {
  constructor(description, data) {
    const httpCode = HttpCode.PAYMENT_REQUIRED;
    const isOperational = true;

    super(httpCode, isOperational, description, data);
  }
}

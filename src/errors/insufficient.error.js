import { HttpCode } from '../utils/HttpCode.js';
import APIError from './api.error.js';

class InsufficientError extends APIError {
  constructor(message, data = undefined) {
    super(HttpCode.PAYMENT_REQUIRED, true, message, data);
  }
}

export default InsufficientError;

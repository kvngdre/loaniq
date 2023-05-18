import { HttpCodes } from '../utils/HttpCodes.js';
import APIError from './api.error.js';

class InsufficientError extends APIError {
  constructor(message, data = undefined) {
    super(HttpCodes.PAYMENT_REQUIRED, true, message, data);
  }
}

export default InsufficientError;

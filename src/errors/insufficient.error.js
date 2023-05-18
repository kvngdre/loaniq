import { HttpCodes } from '../utils/HttpCodes.js';
import APIError from './api.error.js';

class InsufficientError extends APIError {
  constructor(description, data) {
    const name = 'Insufficient Funds Error';
    const httpCode = HttpCodes.PAYMENT_REQUIRED;
    const isOperational = true;

    super(name, httpCode, isOperational, description, data);
  }
}

export default InsufficientError;

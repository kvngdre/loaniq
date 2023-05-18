import { HttpCodes } from '../utils/HttpCodes.js';
import APIError from './api.error.js';

class DependencyError extends APIError {
  constructor(description) {
    const name = 'Dependency Error';
    const httpCode = HttpCodes.DEPENDENCY;
    const isOperational = true;

    super(name, httpCode, isOperational, description);
  }
}

export default DependencyError;

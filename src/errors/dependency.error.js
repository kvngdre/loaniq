import { HttpCodes } from '../utils/HttpCodes.js';
import APIError from './api.error.js';

class DependencyError extends APIError {
  constructor(message, data = undefined) {
    super(HttpCodes.DEPENDENCY, true, message, data);
  }
}

export default DependencyError;

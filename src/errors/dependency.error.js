import { HttpCode } from '../utils/HttpCode.js';
import APIError from './api.error.js';

class DependencyError extends APIError {
  constructor(message, data = undefined) {
    super(HttpCode.DEPENDENCY, true, message, data);
  }
}

export default DependencyError;

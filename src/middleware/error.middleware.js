import APIError from '../errors/api.error.js';
import errorHandler from '../utils/ErrorHandler.js';
import { HttpCode } from '../utils/HttpCode.js';

/**
 *
 * @param {(Error|APIError)} error
 * @returns
 */
function getErrorMessage(error) {
  if (error.statusCode === HttpCode.INTERNAL_SERVER || !error.statusCode)
    return 'Something went wrong';

  return error.message;
}

export default (err, req, res, next) => {
  errorHandler.handleError(err);

  return res.status(err.statusCode || HttpCode.INTERNAL_SERVER).json({
    success: false,
    message: getErrorMessage(err),
    errors: err?.errors ? { ...err.errors } : undefined,
    data: err?.data,
  });
};

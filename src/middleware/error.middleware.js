import errorHandler from '../utils/ErrorHandler.js';
import { HttpCodes } from '../utils/HttpCodes.js';

export default (err, req, res, next) => {
  errorHandler.handleError(err);

  return res.status(err.statusCode || HttpCodes.INTERNAL_SERVER).json({
    statusCode: err.statusCode,
    message: err.message || 'Something went wrong',
    errors: err?.errors ? { ...err.errors } : undefined,
    data: err?.data,
  });
};

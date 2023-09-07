import { BaseHttpResponse } from "../../utils/base-http-response.js";
import { NotFoundError, ValidationError } from "../../utils/errors/index.js";

export function errorHandlingMiddleware(err, req, res, next) {
  if (err instanceof ValidationError) {
    const response = BaseHttpResponse.failed(err.message, 422);
    return res.status(response.statusCode).json(response);
  }

  if (err instanceof NotFoundError) {
    const response = BaseHttpResponse.failed(err.message, 404);
    return res.status(response.statusCode).json(response);
  }

  if (err instanceof Error) {
    const response = BaseHttpResponse.failed(err.message, 500);
    return res.status(response.statusCode).json(response);
  }

  return next();
}

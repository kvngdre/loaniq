import { BaseHttpResponse } from "../../utils/base-http-response.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
  ValidationError,
} from "../../utils/errors/index.js";
import { logger } from "../../utils/logger.js";

export function errorHandlingMiddleware(err, req, res, next) {
  if (err instanceof ValidationError) {
    const response = BaseHttpResponse.failed(err.message, err.errors);
    return res.status(400).json(response);
  }

  if (err instanceof UnauthorizedError) {
    const response = BaseHttpResponse.failed(err.message, err.errors);
    return res.status(401).json(response);
  }

  if (err instanceof ForbiddenError) {
    const response = BaseHttpResponse.failed(err.message, err.errors);
    return res.status(403).json(response);
  }

  if (err instanceof NotFoundError) {
    const response = BaseHttpResponse.failed(err.message, err.errors);
    return res.status(404).json(response);
  }

  if (err instanceof ConflictError) {
    const response = BaseHttpResponse.failed(err.message, err.errors);
    return res.status(409).json(response);
  }

  if (err instanceof ServerError) {
    logger.error(err.message, err.errors);
    const response = BaseHttpResponse.failed(err.message);
    return res.status(500).json(response);
  }

  if (err instanceof Error) {
    logger.fatal(err.message, err.stack);
    const response = BaseHttpResponse.failed("Something Went Wrong");
    return res.status(500).json(response);
  }

  return next();
}

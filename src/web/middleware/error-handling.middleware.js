import { BaseError, ServerError } from "../../utils/errors/index.js";
import { logger } from "../../utils/logger.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";

export function errorHandlingMiddleware(error, req, res, next) {
  // Handle errors with the JSON payload
  if (error instanceof SyntaxError && "body" in error) {
    const response = BaseHttpResponse.failed(
      `Error parsing JSON: ${error.message}`,
      error,
    );
    return res.status(400).json(response);
  }

  if (error instanceof ServerError) {
    logger.error(error.innerException.message, error.innerException.stack);
    const response = BaseHttpResponse.failed(error.message, error.context);
    return res.status(error.statusCode).json(response);
  }

  if (error instanceof BaseError) {
    const response = BaseHttpResponse.failed(error.message, error.context);
    return res.status(error.statusCode).json(response);
  }

  if (error instanceof Error) {
    logger.fatal(error.message, error.stack);
    const response = BaseHttpResponse.failed("Something Went Wrong");
    return res.status(500).json(response);
  }

  return next();
}

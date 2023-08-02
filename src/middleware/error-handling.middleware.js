import { NotFoundException, ValidationException } from "../errors/index.js";
import { BaseHttpResponse } from "../web/lib/base-http-response.js";

export class ErrorHandlingMiddleware {
  static handleError() {
    return (err, req, res, next) => {
      if (err instanceof ValidationException) {
        const response = BaseHttpResponse.failed(err.message, 422);
        return res.status(response.statusCode).json(response);
      }

      if (err instanceof NotFoundException) {
        const response = BaseHttpResponse.failed(err.message, 404);
        return res.status(response.statusCode).json(response);
      }

      if (err instanceof Error) {
        const response = BaseHttpResponse.failed(err.message, 500);
        return res.status(response.statusCode).json(response);
      }

      return next();
    };
  }
}

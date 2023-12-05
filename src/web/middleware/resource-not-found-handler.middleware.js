import { NotFoundError } from "../../utils/errors/index.js";

export function resourceNotFoundMiddleware(req, res, next) {
  const err = new NotFoundError("Resource Not Found");
  next(err);
}

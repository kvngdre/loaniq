import { NotFoundError } from "../../utils/errors/index.js";

export function resourceNotFoundHandler(req, res, next) {
  const err = new NotFoundError("Resource Not Found");
  next(err);
}

import { BaseHttpResponse } from "../lib/base-http-response.js";

export async function checkStatus(req, res, next) {
  if (!req.currentUser.active) {
    const response = BaseHttpResponse.failed(
      "Account deactivated. Contact administrator.",
    );
    return res.status(403).json(response);
  }

  return next();
}

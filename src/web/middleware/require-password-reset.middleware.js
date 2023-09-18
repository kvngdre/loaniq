import { config } from "../../config/index.js";
import dbContext from "../../data/db-context.js";
import { messages } from "../../utils/index.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function requirePasswordReset(req, res, next) {
  if (req.user && req.user.resetPassword) {
    const response = BaseHttpResponse.success(messages.AUTH.LOGIN.RESET_PWD, {
      redirectUrl: `${config.api.base_url}/auth/reset-password`,
    });
    // TODO: should I redirect?
    return res.status(403).json(response);
  }

  const user = await dbContext.User.findOne({ email: req.body.email });
  if (!user) {
    const response = BaseHttpResponse.failed(
      messages.ERROR.NOT_FOUND_Fn("User"),
    );
    return res.status(404).json(response);
  }

  if (user.resetPassword) {
    const response = BaseHttpResponse.success(messages.AUTH.LOGIN.RESET_PWD, {
      redirectUrl: `${config.api.base_url}/auth/reset-password`,
    });
    // TODO: should I redirect?
    return res.status(403).json(response);
  }

  req.user = user._doc;

  return next();
}

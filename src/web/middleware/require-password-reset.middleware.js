import { config } from "../../config/index.js";
import { UserRepository } from "../../data/repositories/user.repository.js";
import { USER_ROLES } from "../../utils/helpers/user.helper.js";
import { messages } from "../../utils/index.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function requirePasswordReset(req, res, next) {
  if (!req.user) {
    const user = await UserRepository.findOne({ email: req.body.email });
    if (!user) {
      const response = BaseHttpResponse.failed(
        messages.ERROR.NOT_FOUND_Fn("User"),
      );

      return res.status(404).json(response);
    }

    req.user = user._doc;
  }

  if (req.user.resetPassword) {
    const redirectUrl =
      req.user.role.name === USER_ROLES.ADMIN
        ? `${config.api.base_url}/auth/reset-password-with-verification`
        : `${config.api.base_url}/auth/reset-password`;

    const response = BaseHttpResponse.success(messages.AUTH.LOGIN.RESET_PWD, {
      redirectUrl,
    });

    // TODO: should I redirect?
    return res.status(403).json(response);
  }

  return next();
}

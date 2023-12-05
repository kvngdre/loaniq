import { config } from "../../config/index.js";
import { USER_STATUS } from "../../utils/helpers/user.helper.js";
import { messages } from "../../utils/messages.utils.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function checkUserStatus(req, res, next) {
  if (req.user.status === USER_STATUS.DEACTIVATED) {
    const response = BaseHttpResponse.failed(
      messages.AUTH.LOGIN.ACCOUNT_DEACTIVATED,
    );

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      // TODO: set this permanently to TRUE
      secure: config.secure_cookie,
    });

    return res.status(403).json(response);
  }

  if (!req.user.isEmailVerified || req.user.status === USER_STATUS.PENDING) {
    const response = BaseHttpResponse.failed(
      messages.AUTH.LOGIN.ACCOUNT_UNVERIFIED,
    );

    return res.status(403).json(response);
  }

  return next();
}

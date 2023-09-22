import { config } from "../../config/index.js";
import { USER_STATUS } from "../../utils/helpers/user.helper.js";
import { messages } from "../../utils/messages.utils.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";

export async function checkUserStatus(req, res, next) {
  let response;

  switch (req.user.status) {
    case USER_STATUS.DEACTIVATED:
      response = BaseHttpResponse.failed(
        messages.AUTH.LOGIN.ACCOUNT_DEACTIVATED,
      );

      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        // TODO: set this permanently to TRUE
        secure: config.secure_cookie,
        // maxAge: config.jwt.ttl.refresh * 1000,
      });

      return res.status(403).json(response);
    case USER_STATUS.PENDING:
      response = BaseHttpResponse.failed(
        messages.AUTH.LOGIN.ACCOUNT_UNVERIFIED,
      );
      return res.status(403).json(response);
    default:
      break;
  }

  return next();
}

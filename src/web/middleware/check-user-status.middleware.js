import { USER_STATUS } from "../../utils/helpers/user.helper.js";
import { messages } from "../../utils/messages.utils.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";

export async function checkUserStatus(req, res, next) {
  let response;
  if (req.user) {
    switch (req.user.status) {
      case USER_STATUS.DEACTIVATED:
        response = BaseHttpResponse.failed(
          messages.AUTH.LOGIN.ACCOUNT_DEACTIVATED,
        );
        return res.status(403).json(response);
      case USER_STATUS.PENDING:
        response = BaseHttpResponse.failed(
          messages.AUTH.LOGIN.ACCOUNT_UNVERIFIED,
        );
        return res.status(403).json(response);
      default:
        break;
    }
  }

  return next();
}

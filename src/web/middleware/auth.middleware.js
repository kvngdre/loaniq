import jwt from "jsonwebtoken";

import { config } from "../../config/index.js";
import dbContext from "../../data/db-context.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";

export async function auth(req, res, next) {
  try {
    const getTokenFromHeader = (request) => {
      if (!request.headers?.authorization) {
        const response = BaseHttpResponse.failed("No Token Provided");
        return res.status(401).json(response);
      }
      return request.headers.authorization.split(" ");
    };

    const [scheme, token] = getTokenFromHeader(req);
    const decoded = jwt.verify(token, config.jwt.secret.access);

    // Checking if token claims are valid.
    if (scheme !== "Bearer" || decoded.iss !== config.jwt.issuer) {
      const response = BaseHttpResponse.failed("Invalid Token Provided");
      return res.status(401).json(response);
    }

    // TODO: Move this to redis
    const user = await dbContext.User.findById(decoded.id).populate({
      path: "role",
      populate: { path: "permissions" },
    });

    // if (!user.active) {
    //   return res.status(HttpCode.FORBIDDEN).json(
    //     new ErrorResponse({
    //       name: "Auth Error",
    //       message: "Account deactivated. Contact administrator.",
    //     }),
    //   );
    // }

    req.currentUser = user._doc;

    return next();
  } catch (exception) {
    if (exception instanceof jwt.JsonWebTokenError) {
      const response = BaseHttpResponse.failed(exception.message);
      return res.status(403).json(response);
    }
    throw exception;
  }
}

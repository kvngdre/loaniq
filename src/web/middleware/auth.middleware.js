import jwt from "jsonwebtoken";

import { config } from "../../config/index.js";
import dbContext from "../../data/db-context.js";
import { messages } from "../../utils/messages.utils.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";

export async function auth(req, res, next) {
  try {
    if (!req.headers?.authorization) {
      const response = BaseHttpResponse.failed("No Token Provided");
      return res.status(401).json(response);
    }

    const [scheme, token] = req.headers.authorization.split(" ");
    if (scheme !== "Bearer") {
      const response = BaseHttpResponse.failed("Invalid Token Provided");
      return res.status(401).json(response);
    }

    const decoded = jwt.verify(token, config.jwt.secret.access, {
      issuer: config.jwt.issuer,
    });

    // TODO: Move this to redis
    if (!req.user) {
      const user = await dbContext.User.findById(decoded.id);
      if (!user) {
        const response = BaseHttpResponse.failed(
          messages.ERROR.NOT_FOUND_Fn("User"),
        );
        return res.status(404).json(response);
      }

      req.user = user._doc;
    }

    return next();
  } catch (exception) {
    if (exception instanceof jwt.JsonWebTokenError) {
      const response = BaseHttpResponse.failed(exception.message);
      return res.status(403).json(response);
    }
    throw exception;
  }
}

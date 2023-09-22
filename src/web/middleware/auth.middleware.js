import jwt from "jsonwebtoken";

import { config } from "../../config/index.js";
import { UserRepository } from "../../data/repositories/user.repository.js";
import { logger, messages } from "../../utils/index.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function auth(req, res, next) {
  try {
    let token;

    if (req.headers.Authorization || req.headers.authorization) {
      const [scheme, extractedToken] = req.headers.authorization.split(" ");
      if (scheme !== "Bearer") {
        const response = BaseHttpResponse.failed("Invalid Token Provided");
        return res.status(401).json(response);
      }

      token = extractedToken;
    } else {
      token = req.query.token || req.cookies.jwt;
    }

    if (!token) {
      const response = BaseHttpResponse.failed("No Token Provided");
      return res.status(401).json(response);
    }

    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: config.jwt.issuer,
    });

    // TODO: Move this to redis
    if (!req.user) {
      const user = await UserRepository.findById(decoded.id);
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
      logger.debug(exception.message);
      const response = BaseHttpResponse.failed("Unauthorized");
      return res.status(401).json(response);
    }
    throw exception;
  }
}

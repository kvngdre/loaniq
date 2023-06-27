import jwt from 'jsonwebtoken';

import { constants } from '../config/index.js';
import { BaseError } from '../errors/lib/base-error.js';
import { User } from '../models/user.model.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import { HttpCode } from '../utils/common.js';

export default async function verifyJWT(req, res, next) {
  try {
    /**
     * We are assuming that the JWT will come in a header with the form
     * Authorization: Bearer ${JWT}
     *
     */
    const getTokenFromHeader = (req) => {
      if (!req.headers?.authorization) {
        return res.status(HttpCode.BAD_REQUEST).json(
          new ErrorResponse({
            name: 'Validation Error',
            message: 'No token provided',
          }),
        );
      }

      return req.headers.authorization.split(' ');
    };

    const [scheme, token] = getTokenFromHeader(req);
    const decoded = jwt.verify(token, constants.jwt.secret.access);

    // Checking if token claims are valid.
    if (scheme !== 'Bearer' || decoded.iss !== constants.jwt.issuer) {
      return res.status(HttpCode.UNAUTHORIZED).json(
        new ErrorResponse({
          name: 'Auth Error',
          message: 'Invalid access token provided.',
        }),
      );
    }

    // TODO: Move this to redis
    // Fetching user...
    const user = await User.findById(decoded.id)
      .populate({ path: 'role', populate: { path: 'permissions' } })
      .catch((error) => {
        if (error instanceof BaseError) {
          return res.status(HttpCode.NOT_FOUND).json(
            new ErrorResponse({
              name: 'Not Found Error',
              message: 'User account not found',
            }),
          );
        }

        throw error;
      });

    // Checking if user is inactive.
    if (!user.active) {
      return res.status(HttpCode.FORBIDDEN).json(
        new ErrorResponse({
          name: 'Auth Error',
          message: 'Account deactivated. Contact administrator.',
        }),
      );
    }

    req.currentUser = user._doc;

    next();
  } catch (exception) {
    if (exception instanceof jwt.JsonWebTokenError) {
      res.status(HttpCode.FORBIDDEN).json(
        new ErrorResponse({
          name: 'Auth Error',
          message: exception.message,
        }),
      );
    }

    throw exception;
  }
}

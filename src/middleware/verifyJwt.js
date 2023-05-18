import jwt from 'jsonwebtoken';
import { constants } from '../config/index.js';
import APIError from '../errors/api.error.js';
import ForbiddenError from '../errors/forbidden.error.js';
import NotFoundError from '../errors/notFound.error.js';
import UnauthorizedError from '../errors/unauthorized.error.js';
import ValidationError from '../errors/validation.error.js';
import User from '../models/user.model.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import { HttpCodes } from '../utils/HttpCodes.js';

export default async function verifyJWT(req, res, next) {
  try {
    /**
     * We are assuming that the JWT will come in a header with the form
     * Authorization: Bearer ${JWT}
     *
     */
    const getTokenFromHeader = (req) => {
      if (!req.headers?.authorization) {
        throw new ValidationError('No token provided');
      }

      return req.headers.authorization.split(' ');
    };

    const [scheme, token] = getTokenFromHeader(req);
    const decoded = jwt.verify(token, constants.jwt.secret.access);

    // Checking if token claims are valid.
    if (scheme !== 'Bearer' || decoded.iss !== constants.jwt.issuer) {
      throw new UnauthorizedError('Invalid access token provided');
    }

    // TODO: Move this to redis
    // Fetching user...
    const user = await User.findById(decoded.id).populate({ path: 'role', populate: { path: 'permissions' } });
    if (!user) {
      throw new NotFoundError('User account not found');
    }

    // Checking if user is inactive.
    if (!user.active) {
      throw new ForbiddenError('Account deactivated. Contact administrator.');
    }

    req.currentUser = user._doc;

    next();
  } catch (exception) {
    if (exception instanceof jwt.JsonWebTokenError) {
      throw new ForbiddenError(exception.message);
    }

    throw exception;
  }
}

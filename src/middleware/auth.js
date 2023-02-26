import { constants } from '../config'
import BaseError from '../errors/BaseError'
import ForbiddenError from '../errors/ForbiddenError'
import jwt from 'jsonwebtoken'
import UnauthorizedError from '../errors/UnauthorizedError'

export default function auth (req, res, next) {
  try {
    /**
     * We are assuming that the JWT will come in a header with the form
     *
     * Authorization: Bearer ${JWT}
     *
     */
    function getTokenFromHeader (req) {
      if (
        req.headers?.authorization?.split(' ')[0] === 'Bearer' ||
        req.headers?.authorization?.split(' ')[0] === 'Token'
      ) {
        return req.headers.authorization.split(' ')[1]
      }

      throw new UnauthorizedError('No token provided.')
    }

    const token = getTokenFromHeader(req)
    const decoded = jwt.verify(token, constants.jwt.secret.access)

    if (
      decoded.iss !== constants.jwt.issuer ||
      decoded.aud !== constants.jwt.audience
    ) {
      throw new UnauthorizedError('Invalid token provided.')
    }

    req.currentUser = decoded

    next()
  } catch (exception) {
    // if (exception.name === 'TokenExpiredError') {
    //   throw new ForbiddenError('Session expired.')
    // }

    if (exception instanceof BaseError) {
      throw exception
    }

    throw new ForbiddenError(exception.message)
  }
}

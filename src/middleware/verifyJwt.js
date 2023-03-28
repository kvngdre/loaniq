import { constants } from '../config'
import { httpCodes } from '../utils/common'
import BaseError from '../errors/BaseError'
import ErrorResponse from '../utils/ErrorResponse'
import jwt from 'jsonwebtoken'
import UserService from '../services/user.service'

export default async function verifyJWT (req, res, next) {
  try {
    /**
     * We are assuming that the JWT will come in a header with the form
     * Authorization: Bearer ${JWT}
     *
     */
    const getTokenFromHeader = (req) => {
      if (!req.headers?.authorization) {
        return res.status(httpCodes.BAD_REQUEST).json(
          new ErrorResponse({
            name: 'Validation Error',
            message: 'No token provided.'
          })
        )
      }

      return req.headers.authorization.split(' ')
    }

    const [scheme, token] = getTokenFromHeader(req)
    const decoded = jwt.verify(token, constants.jwt.secret.access)

    // Checking if token claims are valid.
    if (scheme !== 'Bearer' || decoded.iss !== constants.jwt.issuer) {
      return res.status(httpCodes.UNAUTHORIZED).json(
        new ErrorResponse({
          name: 'Auth Error',
          message: 'Invalid access token provided.'
        })
      )
    }

    // Checking if user is inactive.
    // TODO: Move this to redis
    const user = await UserService.getUserById(decoded.id)
    if (!user.active) {
      return res.status(httpCodes.FORBIDDEN).json(
        new ErrorResponse({
          name: 'Auth Error',
          message: 'Account deactivated. Contact administrator.'
        })
      )
    }

    req.currentUser = user._doc

    next()
  } catch (exception) {
    if (exception instanceof BaseError) {
      throw exception
    }

    res.status(httpCodes.FORBIDDEN).json(
      new ErrorResponse({
        name: 'Auth Error',
        message: exception.message
      })
    )
  }
}

import { constants } from '../config'
import { httpCodes } from '../utils/constants'
import BaseError from '../errors/BaseError'
import ErrorResponse from '../utils/ErrorResponse'
import jwt from 'jsonwebtoken'
import UserService from '../services/user.service'

export default async function auth (req, res, next) {
  try {
    /**
     * We are assuming that the JWT will come in a header with the form
     * Authorization: Bearer ${JWT}
     *
     */
    console.log(req.originalUrl)
    function getTokenFromHeader (req) {
      if (req.headers?.authorization?.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1]
      }
      return res.status(httpCodes.UNAUTHORIZED).json(
        new ErrorResponse({
          name: 'Auth Error',
          message: 'Invalid token provided.'
        })
      )
    }

    const token = getTokenFromHeader(req)
    const decoded = jwt.verify(token, constants.jwt.secret.access)

    // Checking if token claims are valid.
    if (
      decoded.iss !== constants.jwt.issuer ||
      decoded.aud !== constants.jwt.audience
    ) {
      return res.status(httpCodes.UNAUTHORIZED).json(
        new ErrorResponse({
          name: 'Auth Error',
          message: 'Invalid token provided.'
        })
      )
    }

    // Checking if user is inactive.
    const foundUser = await UserService.getUserById(decoded.id)
    if (!foundUser.active) {
      return res.status(httpCodes.FORBIDDEN).json(
        new ErrorResponse({
          name: 'Auth Error',
          message: 'Account deactivated. Contact administrator.'
        })
      )
    }

    req.currentUser = foundUser._doc

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

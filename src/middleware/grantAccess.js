/* eslint-disable eqeqeq */
import { httpCodes } from '../utils/constants'
import { roles } from '../config'
import ErrorResponse from '../utils/ErrorResponse'

/**
 * Grants or denies user access to resource
 * @param {string[]} allowedRoles The role or array of roles permitted.
 * @returns
 */
function grantAccess (...allowedRoles) {
  return (req, res, next) => {
    if (!req.currentUser.role) {
      return res.status(httpCodes.FORBIDDEN).json(
        new ErrorResponse({
          name: 'Auth Error',
          message: 'No user role.'
        })
      )
    }

    const { currentUser, params } = req

    if (
      allowedRoles.includes(currentUser.role) &&
      (params?.userId == currentUser._id ||
        params?.tenantId == currentUser.tenantId ||
        currentUser.role === roles.SUPER_ADMIN)
    ) {
      return next()
    }

    res.status(httpCodes.FORBIDDEN).json(
      new ErrorResponse({
        name: 'Auth Error',
        message:
          'You do not have sufficient permissions to perform this action.'
      })
    )
  }
}

export default grantAccess

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
  allowedRoles = allowedRoles[0] === 'all' ? Object.values(roles) : allowedRoles
  return (req, res, next) => {
    if (!req.currentUser.role) {
      return res.status(httpCodes.FORBIDDEN).json(
        new ErrorResponse({
          name: 'Auth Error',
          message: 'Forbidden'
        })
      )
    }

    const { currentUser, params } = req

    if (
      allowedRoles.includes(currentUser.role) &&
      (params?.tenantId == currentUser.tenantId ||
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

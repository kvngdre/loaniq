/* eslint-disable eqeqeq */
import { httpCodes } from '../utils/common.js';
import { roles } from '../config/index.js';
import ErrorResponse from '../utils/ErrorResponse.js';

/**
 * Grants or denies user access to resource
 * @param {string[]} allowedRoles The role or array of roles permitted.
 * @returns
 */
function grantAccess(...allowedRoles) {
  if (allowedRoles[0] === 'all') {
    allowedRoles = Object.values(roles);
  }

  return (req, res, next) => {
    if (!req.currentUser.role) {
      return res.status(httpCodes.FORBIDDEN).json(
        new ErrorResponse({
          name: 'Auth Error',
          message: 'Forbidden',
        }),
      );
    }

    if (!allowedRoles.includes(req.currentUser.role)) {
      return res.status(httpCodes.FORBIDDEN).json(
        new ErrorResponse({
          name: 'Auth Error',
          message: 'You do not have sufficient permissions to perform this action.',
        }),
      );
    }

    next();
  };
}

export default grantAccess;

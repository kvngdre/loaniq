/* eslint-disable eqeqeq */
import { httpCodes } from '../utils/common.js';
import { roles } from '../config/index.js';
import ErrorResponse from '../utils/ErrorResponse.js';

const isOwner = (...rolesToCheck) => {
  let disallowedRoles = [roles.AGENT, roles.ANALYST, roles.SUPPORT];

  if (rolesToCheck[0] === 'all') {
    disallowedRoles = Array.from(new Set(disallowedRoles.concat(Object.values(roles))));
  } else {
    disallowedRoles = disallowedRoles.concat(rolesToCheck);
  }

  return (req, res, next) => {
    if (req.params.userId != req.currentUser._id && disallowedRoles.includes(req.currentUser.role)) {
      return res.status(httpCodes.FORBIDDEN).json(
        new ErrorResponse({
          name: 'Auth Error',
          message: 'You do not have sufficient permissions to perform this action.',
        }),
      );
    }

    next();
  };
};

export default isOwner;

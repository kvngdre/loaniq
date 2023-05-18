import { httpCodes } from '../utils/common.js';
import { Types } from 'mongoose';
import ErrorResponse from '../utils/ErrorResponse.js';

export default function (req, res, next) {
  for (const key in req.params) {
    if (/[a-z]+Id$|^id$/g.test(key) && !Types.ObjectId.isValid(req.params[key])) {
      return res.status(httpCodes.BAD_REQUEST).json(
        new ErrorResponse({
          name: 'Validation Error',
          message: `Invalid ${key.replace(/([a-z])([A-Z])/, '$1 $2').toLowerCase()}`,
        }),
      );
    }
  }

  next();
}

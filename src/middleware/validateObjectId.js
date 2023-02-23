import { Types } from 'mongoose'

export default function (req, res, next) {
  for (const param in req.params) {
    if (
      req.params[param] &&
            !Types.ObjectId.isValid(req.params[param])
    ) {
      return res
        .status(400)
        .json({ success: false, message: `Invalid ${param}` })
    }
  }

  next()
};

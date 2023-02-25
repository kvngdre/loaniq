import { Types } from 'mongoose'
import ValidationError from '../errors/ValidationError'

export default function (req, res, next) {
  for (const key in req.params) {
    if (/[a-z]+Id$|^id$/g.test(key) && !Types.ObjectId.isValid(req.params[key])) {
      throw new ValidationError(
        `Invalid ${key.replace(/([a-z])([A-Z])/, '$1 $2').toLowerCase()}`
      )
    }
  }

  next()
}

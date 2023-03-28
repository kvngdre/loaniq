import BaseValidator from './base.validator'
import Joi from 'joi'
class AuthValidator extends BaseValidator {
  validateLogin = (dto) => {
    const schema = Joi.object({
      email: this._emailSchema.required(),
      password: Joi.string().max(256).label('Password').required()
    })

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }

  validateSendOTP = (dto) => {
    const schema = Joi.object({
      email: this._emailSchema.required(),
      len: Joi.number().valid(6, 8).required()
    })

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }
}

export default new AuthValidator()

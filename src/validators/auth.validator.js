import Joi from 'joi'
import BaseValidator from './base.validator'
class AuthValidator extends BaseValidator {
  validateVerifyReg = (dto) => {
    const schema = Joi.object({
      email: this._emailSchema.required(),
      otp: this._otpSchema.required(),
      current_password: Joi.string().label('Current password').required(),
      new_password: this._passwordSchema.required(),
      confirm_password: Joi.string()
        .label('Confirm password')
        .equal(Joi.ref('new_password'))
        .messages({ 'any.only': 'Passwords do not match' })
        .required()
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }

  validateLogin = (dto) => {
    const schema = Joi.object({
      email: this._emailSchema.required(),
      password: Joi.string().max(256).label('Password').required()
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }

  validateSendOTP = (dto) => {
    const schema = Joi.object({
      email: this._emailSchema.required()
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }
}

export default new AuthValidator()

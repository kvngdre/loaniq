import BaseValidator from './base.validator'
import Joi from 'joi'
class AuthValidator extends BaseValidator {
  validateVerifyReg = (dto) => {
    const schema = Joi.object({
      email: this._emailSchema.required(),
      otp: this._otpSchema(6).required(),
      current_password: Joi.string().trim().label('Current password').required(),
      new_password: this._passwordSchema.required(),
      confirm_password: this._confirmPasswordSchema.required()
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
      email: this._emailSchema.required(),
      len: Joi.number().valid(6, 8).required()
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }
}

export default new AuthValidator()

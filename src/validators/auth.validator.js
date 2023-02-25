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
        .equal(Joi.ref('new_password'))
        .messages({ 'any.only': 'Passwords do not match' }).required()
    })

    const { value, error } = schema.validate(dto)
    if (error) this.formatErrorMessage(error)

    return { value, error }
  }

  validateLogin = (dto) => {
    const schema = Joi.object({
      email: this._emailSchema.required(),
      password: Joi.string().max(256).label('Password').required()
    })

    const { value, error } = schema.validate(dto)
    if (error) this.formatErrorMessage(error)

    return { value, error }
  }

  validateSendOTP = (dto) => {
    const schema = Joi.object({
      email: this._emailSchema.required()
    })

    const { value, error } = schema.validate(dto)
    if (error) this.formatErrorMessage(error)

    return { value, error }
  }
}

export default new AuthValidator()

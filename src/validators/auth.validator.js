import BaseValidator from './base.validator.js'
import Joi from 'joi'
class AuthValidator extends BaseValidator {
  validateLogin = (loginDTO) => {
    let schema = Joi.object({
      email: this._emailSchema,
      phoneOrStaffId: this._phoneOrStaffIdSchema
    }).xor('email', 'phoneOrStaffId').messages({ 'object.xor': 'Value cannot contain both email and phoneOrStaffId' })

    if (loginDTO.email) {
      schema = schema.keys({
        password: Joi.string().max(50).label('Password').required()
      })
    } else {
      schema = schema.keys({
        passcode: Joi.string().max(50).label('Passcode').required()
      })
    }

    let { value, error } = schema.validate(loginDTO, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }

  validateSendOTP = (dto) => {
    const schema = Joi.object({
      email: this._emailSchema,
      phone: this._phoneNumberSchema,
      len: Joi.number().greater(5).less(9)
    }).xor('email', 'phone').messages({ 'object.xor': 'Value cannot contain both email and phone' })

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }
}

export default new AuthValidator()

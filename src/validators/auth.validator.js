import BaseValidator from './base.validator.js'
import Joi from 'joi'
class AuthValidator extends BaseValidator {
  #ippisSchema

  constructor () {
    super()

    this.#ippisSchema = Joi.string().alphanum()
  }

  validateLogin = (dto) => {
    const schema = Joi.object({
      email: this._emailSchema,
      staff_id: this.#ippisSchema,
      password: Joi.string().max(256).label('Password').required()
    }).xor('email', 'staff_id')

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }

  validateSendOTP = (dto) => {
    const schema = Joi.object({
      email: this._emailSchema.required(),
      len: Joi.number().greater(5).less(9)
    })

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }
}

export default new AuthValidator()

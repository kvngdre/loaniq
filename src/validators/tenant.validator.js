import { companyCategory } from '../utils/constants'
import BaseValidator from './base.validator'
import Joi from 'joi'
class TenantValidator extends BaseValidator {
  #companyNameSchema
  #cacNumberSchema
  #categorySchema

  constructor () {
    super()

    this.#companyNameSchema = Joi.string()
      .label('Company name')
      .min(2)
      .max(255)
      .messages({
        'string.min': '{#label} is not valid',
        'string.max': '{#label} is too long'
      })

    this.#cacNumberSchema = Joi.string()
      .label('CAC number')
      .pattern(/^RC[\d]{3,8}$/)
      .invalid('RC0000', 'RC000')
      .messages({
        'any.invalid': '{#label} is not valid',
        'string.pattern.base': '{#label} must begin with "RC"'
      })

    this.#categorySchema = Joi.string()
      .label('Category')
      .valid(...companyCategory)
      .messages({ 'any.only': 'Not a valid category' })
  }

  validateSignUp = (dto) => {
    const schema = Joi.object({
      tenant: Joi.object({
        company_name: this.#companyNameSchema.required(),
        category: this.#categorySchema.required(),
        email: this._emailSchema.label('Company email').required()
      }).required(),
      user: Joi.object({
        name: this._nameSchema.and('first', 'last').required(),
        email: this._emailSchema.label('User email').required(),
        phone_number: this._phoneNumberSchema.required()
      }).required()
    })

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }

  validateUpdate = (dto) => {
    const schema = Joi.object({
      logo: Joi.string(),
      company_name: this.#companyNameSchema,
      location: this._locationSchema,
      cac_number: this.#cacNumberSchema,
      category: this.#categorySchema,
      email: this._emailSchema,
      phone_number: this._phoneNumberSchema
    }).min(1)

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }

  validateActivate = (dto) => {
    const schema = Joi.object({
      location: Joi.object()
        .keys({
          address: this._locationSchema.extract('address').required(),
          lga: this._locationSchema.extract('lga').required(),
          state: this._locationSchema.extract('state').required()
        })
        .required(),
      cac_number: this.#cacNumberSchema.required()
    })

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }

  validateDeactivate = (dto) => {
    const schema = Joi.object({
      otp: this._otpSchema(8)
    })

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }
}

export default new TenantValidator()

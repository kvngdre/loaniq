import { companyCategory, socials } from '../utils/constants'
import BaseValidator from './base.validator'
import Joi from 'joi'
class TenantValidator extends BaseValidator {
  #companyNameSchema
  #cacNumberSchema
  #categorySchema
  #socialSchema
  #supportSchema
  #allowUserPwdResetSchema

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

    this.#socialSchema = Joi.array().items(
      Joi.object({
        platform: Joi.string()
          .label('Platform')
          .trim()
          .valid(...socials)
          // .messages({ 'any.only': '{#label} is not supported' })
          .required(),
        url: Joi.string()
          .label('URL')
          .trim()
          .custom((value, helpers) => {
            try {
              const regex = /^www\./
              if (regex.test(value)) value = 'https://' + value

              const url = new URL(value)
              if (url.protocol !== 'https:') return helpers.error('any.only')

              return url.href
            } catch (error) {
              return helpers.error('any.invalid')
            }
          })
          .messages({
            'any.only': 'Must be a secure {#label}',
            'any.invalid': '{#label} is invalid'
          })
          .required()
      })
    )

    this.#supportSchema = Joi.object({
      email: this._emailSchema.label('Support email'),
      phone_number: this._phoneNumberSchema.label('Support phone number')
    }).min(1)

    this.#allowUserPwdResetSchema = Joi.boolean()
      .label('Allow user password reset')
      .default(false)
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
      address: this._locationSchema.extract('address'),
      state: this._locationSchema.extract('state'),
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
      cac_number: this.#cacNumberSchema.required(),
      address: this._locationSchema.extract('address').required(),
      state: this._locationSchema.extract('state').required()
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

  validateCreateConfig = (dto, tenantId) => {
    const schema = Joi.object({
      tenantId: this._objectIdSchema.label('Tenant id').default(tenantId).forbidden(),
      default_params: Joi.object()
        .keys({
          min_loan_amount: this._amountSchema
            .label('Minimum loan amount')
            .required(),
          max_loan_amount: this._amountSchema
            .label('Maximum loan amount')
            .required(),
          min_tenor: this._tenorSchema.label('Minimum loan tenor').required(),
          max_tenor: this._tenorSchema.label('Maximum loan tenor').required(),
          interest_rate: this._percentageSchema.required(),
          max_dti: this._percentageSchema.label('Maximum D.T.I').required()
        })
        .label('Default parameters'),
      fees: this._feesSchema,
      socials: this.#socialSchema.min(1),
      support: this.#supportSchema,
      allowUserPwdReset: this.#allowUserPwdResetSchema
    })

    let { value, error } = schema.validate(dto, { abortEarly: false, convert: false })
    error = this._refineError(error)

    return { value, error }
  }

  validateUpdateConfig = (dto) => {
    const schema = Joi.object({
      default_params: Joi.object({
        min_loan_amount: this._amountSchema.label('Minimum loan amount'),
        max_loan_amount: this._amountSchema.label('Maximum loan amount'),
        min_tenor: this._tenorSchema.label('Minimum loan tenor'),
        max_tenor: this._tenorSchema.label('Maximum loan tenor'),
        interest_rate: this._percentageSchema,
        max_dti: this._percentageSchema.label('Maximum D.T.I')
      })
        .min(1)
        .label('Default parameters'),
      fees: this._feesSchema,
      socials: this.#socialSchema.min(1),
      support: this.#supportSchema,
      allowUserPwdReset: this.#allowUserPwdResetSchema
    }).min(1)

    let { value, error } = schema.validate(dto, { abortEarly: false, convert: false })
    error = this._refineError(error)

    return { value, error }
  }
}

export default new TenantValidator()

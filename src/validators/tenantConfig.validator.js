import { socials } from '../utils/common'
import BaseValidator from './base.validator'
import Joi from 'joi'

class TenantConfigValidator extends BaseValidator {
  #socialSchema
  #supportSchema
  #allowUserPwdResetSchema

  constructor () {
    super()

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

    this.#allowUserPwdResetSchema = Joi.boolean().label('Allow user password reset').default(false)
  }

  validateCreate = (dto) => {
    const schema = Joi.object({
      tenantId: this._objectIdSchema.label('Tenant id').required(),
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
      allowUserPwdReset: this.#allowUserPwdResetSchema
    })

    let { value, error } = schema.validate(dto, { abortEarly: false, convert: false })
    error = this._refineError(error)

    return { value, error }
  }

  validateUpdate = (dto) => {
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
      allowUserPwdReset: this.#allowUserPwdResetSchema
    }).min(1)

    let { value, error } = schema.validate(dto, { abortEarly: false, convert: false })
    error = this._refineError(error)

    return { value, error }
  }
}

export default new TenantConfigValidator()

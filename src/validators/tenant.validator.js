import { companyCategory, socials, status, validIds } from '../utils/common.js'
import { Types } from 'mongoose'
import BaseValidator from './base.validator.js'
import Joi from 'joi'
import randomString from '../utils/randomString.js'
class TenantValidator extends BaseValidator {
  #companyNameSchema
  #cacNumberSchema
  #categorySchema
  #socialSchema
  #supportSchema
  #allowUserPwdResetSchema
  #idTypeSchema
  #idSchema

  constructor () {
    super()

    this.#companyNameSchema = Joi.string()
      .label('Company name')
      .min(2)
      .max(255)
      .lowercase()
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
      .lowercase()
      .label('Category')
      .valid(...companyCategory)
      .messages({ 'any.only': 'Not a valid category' })

    this.#socialSchema = Joi.array().items(
      Joi.object({
        platform: Joi.string()
          .lowercase()
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

    this.#idTypeSchema = Joi.string()
      .lowercase()
      .label('Id type')
      .valid(...validIds.filter((id) => id !== 'staff id card'))

    this.#idSchema = Joi.string().alphanum().trim().uppercase().messages({
      'string.pattern.base': 'Invalid staff id number'
    })

    this.#supportSchema = Joi.object({
      email: this._emailSchema.label('Support email'),
      phone_number: this._phoneNumberSchema.label('Support phone number')
    })
      .min(1)
      .label('Support')

    this.#allowUserPwdResetSchema = Joi.boolean()
      .label('Allow user password reset')
      .default(false)
  }

  validateSignUp = (dto) => {
    const newUserId = new Types.ObjectId()
    const newTenantId = new Types.ObjectId()
    const adminRoleId = new Types.ObjectId()

    const schema = Joi.object({
      tenant: Joi.object({
        _id: Joi.any().default(newTenantId).forbidden(),
        // company_name: this.#companyNameSchema.required(),
        status: Joi.string().default(status.onboarding).forbidden()
      }).required(),
      user: Joi.object({
        _id: Joi.any().default(newUserId).forbidden(),
        tenantId: Joi.any().default(newTenantId).forbidden(),
        first_name: this._nameSchema.extract('first').required(),
        last_name: this._nameSchema.extract('last').required(),
        email: this._emailSchema.required(),
        phone_number: this._phoneNumberSchema.required(),
        new_password: this._passwordSchema.required(),
        confirm_password: this._confirmPasswordSchema.required(),
        // password: Joi.string().default(randomString(8)).forbidden(),
        role: Joi.any().default(adminRoleId).forbidden(),
        resetPwd: Joi.boolean().default(false).forbidden()
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
      phone_number: this._phoneNumberSchema,
      support: this.#supportSchema
    }).min(1)

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }

  validateOnBoarding = (onBoardTenantDTO) => {
    const schema = Joi.object({
      category: this.#categorySchema.required(),
      cac_number: this.#cacNumberSchema.required(),
      email: this._emailSchema.required()
    })

    let { value, error } = schema.validate(onBoardTenantDTO, {
      abortEarly: false
    })
    error = this._refineError(error)

    return { value, error }
  }

  validateActivate = (activateTenantDTO) => {
    const schema = Joi.object({
      phone_number: this._phoneNumberSchema,
      address: this._locationSchema.extract('address').required(),
      state: this._locationSchema.extract('state').required(),
      owner_id_type: this.#idTypeSchema.required(),
      owner_id_number: this.#idSchema.label('Id number').required(),
      support: this.#supportSchema.required()
    })

    let { value, error } = schema.validate(activateTenantDTO, {
      abortEarly: false
    })
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

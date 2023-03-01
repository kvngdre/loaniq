import { userRoles, getUserRoleKeys } from '../utils/userRoles'
import BaseValidator from './base.validator'
import Joi from 'joi'

class UserValidator extends BaseValidator {
  #jobTitle
  #displayNameSchema
  #segmentsSchema

  constructor () {
    super()

    this.#jobTitle = Joi.string().label('Job title').min(2).max(50).messages({
      'string.min': '{#label} is not valid',
      'string.max': '{#label} is too long'
    })

    this.#displayNameSchema = Joi.string().label('Display name').max(255)

    this.#segmentsSchema = Joi.alternatives()
      .try(
        Joi.array()
          .items(this._objectIdSchema)
          .min(1)
          .messages({ 'array.min': '{#label} array cannot be empty' }),
        Joi.string().valid('ALL')
      )
      .label('Segments')
      .messages({
        'alternatives.types':
          "{#label} must be an array of object ids or string 'ALL'"
      })
  }

  validateCreate = (dto, tenantId) => {
    const invalidRoles = getUserRoleKeys(userRoles.OWNER)

    const schema = Joi.object({
      tenantId: this._objectIdSchema.label('Tenant id').default(tenantId),
      name: Joi.object()
        .keys({
          first: this._nameSchema.extract('first').required(),
          last: this._nameSchema.extract('last').required(),
          middle: this._nameSchema.extract('middle')
        })
        .required(),
      job_title: this.#jobTitle,
      gender: this._genderSchema.required(),
      dob: this._dateSchema.label('Date of birth').less('now'),
      display_name: this.#displayNameSchema.default((parent) => {
        return `${parent.name.first} ${parent.name.last}`
      }),
      phone_number: this._phoneNumberSchema.required(),
      email: this._emailSchema.required(),
      role: this._roleSchema.invalid(...invalidRoles).required()
      // segments: this.#segmentsSchema.required()
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }

  validateUpdate = (dto) => {
    const invalidRoles = getUserRoleKeys(userRoles.OWNER)

    const schema = Joi.object({
      name: Joi.object().keys({
        first: this._nameSchema.extract('first'),
        last: this._nameSchema.extract('last'),
        middle: this._nameSchema.extract('middle')
      }),
      job_title: this.#jobTitle,
      gender: this._genderSchema,
      dob: this._dateSchema.label('Date of birth').less('now'),
      display_name: this.#displayNameSchema,
      role: this._roleSchema.invalid(...invalidRoles)
      // segments: this.#segmentsSchema
    }).min(1)

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }

  validateChangePassword = (dto) => {
    const schema = Joi.object({
      current_password: Joi.string().label('Current password').required(),
      new_password: this._passwordSchema.required(),
      confirm_password: this._confirmPasswordSchema.required()
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }
}

export default new UserValidator()

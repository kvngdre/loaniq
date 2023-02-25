import Joi from 'joi'
import BaseValidator from './base.validator'
import joiObjectId from 'joi-objectid'
import { userRoles } from '../utils/constants'
Joi.objectId = joiObjectId(Joi)

class UserValidator extends BaseValidator {
  #jobTitle
  #assignedSegmentsSchema

  constructor () {
    super()

    this.#jobTitle = Joi.string().label('Job title').min(2).max(50).messages({
      'string.min': '{#label} is not valid',
      'string.max': '{#label} is too long',
      'any.required': '{#label} is required'
    })

    this.#assignedSegmentsSchema = Joi.alternatives().try(
      Joi.array().label('Assigned segments').items(Joi.objectId).min(1),
      Joi.string().label('Assigned segments').valid('all')
    )
  }

  validateCreate (dto, tenantId) {
    const schema = Joi.object({
      tenantId: Joi.objectId.default(tenantId),
      name: this._nameSchema.min(2).with('first', 'last'),
      job_title: this.#jobTitle,
      gender: this._genderSchema.required(),
      dob: this._dobSchema.required(),
      display_name: this._displayNameSchema.default((parent, helpers) => {
        return `${parent.name.first} ${parent.name.last}`
      }),
      phone_number: this._phoneNumberSchema.required(),
      email: this._emailSchema.required(),
      role: this._roleSchema.invalid(userRoles.OWNER).required()
    })
  }
}

export default UserValidator

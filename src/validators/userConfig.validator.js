import BaseValidator from './base.validator.js'
import Joi from 'joi'

class UserConfigValidator extends BaseValidator {
  #timezoneSchema

  constructor () {
    super()

    const supportedTimeZones = Intl.supportedValuesOf('timeZone')
    this.#timezoneSchema = Joi.string()
      .label('Timezone')
      .valid(...supportedTimeZones)
      .messages({
        'any.only': '{#label} is not supported'
      })
  }

  validateCreate = (dto) => {
    const schema = Joi.object({
      tenantId: this._objectIdSchema.label('Tenant id').required(),
      userId: this._objectIdSchema.label('User id').required(),
      timezone: this.#timezoneSchema
    })

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }

  validateUpdate = (dto) => {
    const schema = Joi.object({
      tenantId: this._objectIdSchema.label('Tenant id'),
      userId: this._objectIdSchema.label('User id'),
      timezone: this.#timezoneSchema
    })

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }
}

export default new UserConfigValidator()

import BaseValidator from './base.validator'
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
      tenantId: this._objectIdSchema().label('Tenant id').required(),
      userId: this._objectIdSchema().label('User id').required(),
      timezone: this.#timezoneSchema
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }

  validateUpdate = (dto, tenantId, userId) => {
    const schema = Joi.object({
      tenantId: this._objectIdSchema()
        .label('Tenant id')
        .default(tenantId)
        .forbidden(),
      userId: this._objectIdSchema()
        .label('User id')
        .default(userId)
        .forbidden(),
      timezone: this.#timezoneSchema
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }
}

export default new UserConfigValidator()

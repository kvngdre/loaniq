import BaseValidator from './base.validator'
import Joi from 'joi'

class UserConfigValidator extends BaseValidator {
  validateCreate = (dto) => {
    const schema = Joi.schema({
      tenantId: this._objectIdSchema().label('Tenant id').required(),
      userId: this._objectIdSchema().label('User id').required()
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }
}

export default new UserConfigValidator()

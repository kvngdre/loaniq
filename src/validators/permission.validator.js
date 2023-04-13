import BaseValidator from './base.validator.js'
import Joi from 'joi'

class PermissionValidator extends BaseValidator {
  #nameSchema
  #levelSchema

  constructor() {
    super()
    this.#nameSchema = Joi.string().lowercase().trim().label('Name').max(100)
    this.#levelSchema = Joi.string().valid('admin', 'user').label('Level')
  }

  validateCreate = (newPermissionDTO) => {
    const schema = Joi.object({
      name: this.#nameSchema.required(),
      description: this._descSchema.required(),
      action: this.#nameSchema.label('Action').required(),
      target: this.#nameSchema.label('Target').required(),
      type: this.#nameSchema.label('Type').required(),
      level: this.#levelSchema
    })

    let { value, error } = schema.validate(newPermissionDTO, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }

  validateUpdate = (updatePermissionDTO) => {
    const schema = Joi.object({
      name: this.#nameSchema,
      description: this._descSchema,
      action: this.#nameSchema.label('Action'),
      target: this.#nameSchema.label('Target'),
      type: this.#nameSchema.label('Type'),
      level: this.#levelSchema
    })

    let { value, error } = schema.validate(updatePermissionDTO, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }
}

export default new PermissionValidator()

import BaseValidator from './base.validator'
import Joi from 'joi'

class SegmentValidator extends BaseValidator {
  #nameSchema
  #codeSchema
  #prefixSchema

  constructor () {
    super()

    this.#nameSchema = Joi.string().label('Segment name').max(255).messages({
      'string.max': 'Segment name is too long'
    })

    this.#codeSchema = Joi.string()
      .label('Segment code')
      .pattern(/^[a-zA-Z]{2,5}$/)
      .messages({
        'string.pattern.base': '{#label} is not valid'
      })

    this.#prefixSchema = Joi.string()
      .label('ID prefix')
      .pattern(/[a-zA-Z]{2,8}/)
      .messages({
        'string.pattern.base': '{#label} is not valid'
      })
  }

  validateCreate = (dto) => {
    const schema = Joi.object({
      code: this.#codeSchema.required(),
      name: this.#nameSchema.required(),
      id_prefix: this.#prefixSchema.required(),
      active: this._activeSchema
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }

  validateUpdate = (dto) => {
    const schema = Joi.object({
      code: this.#codeSchema,
      name: this.#nameSchema,
      id_prefix: this.#prefixSchema,
      active: this._activeSchema
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }
}

export default new SegmentValidator()

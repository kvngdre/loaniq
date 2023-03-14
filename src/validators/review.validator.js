import Joi from 'joi'
import { reviewStatus } from '../utils/constants'
import BaseValidator from './base.validator'

class ReviewValidator extends BaseValidator {
  #typeSchema
  #commentSchema
  #statusSchema

  constructor () {
    super()

    this.#typeSchema = Joi.string().valid('Customer', 'Loan').label('Type')
    this.#commentSchema = Joi.string()
      .label('Comment')
      .max(255)
      .invalid('', ' ')
    this.#statusSchema = Joi.string()
      .label('Status')
      .valid(...Object.values(reviewStatus))
  }

  validateCreate = (userId, tenantId, dto) => {
    const schema = Joi.object({
      tenantId: this._objectIdSchema.label('Tenant id').default(tenantId),
      document: this._objectIdSchema.label('Document'),
      type: this.#typeSchema.required(),
      alteration: Joi.object().required(),
      comment: this.#commentSchema,
      created_by: this._objectIdSchema.label('User id').default(userId)
    })

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }

  validateUpdate = (userId, dto) => {
    const schema = Joi.object({
      document: this._objectIdSchema.label('Document'),
      type: this.#typeSchema,
      remark: this.#commentSchema.label('Remark').when('status', {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      alteration: Joi.object(),
      comment: this.#commentSchema,
      modified_By: this._objectIdSchema.label('User id').default(userId)
    })

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }

  validateStatusUpdate = (userId, dto) => {
    const schema = Joi.object({
      status: this.#statusSchema.required(),
      remark: this.#commentSchema.label('Remark').required(),
      modified_By: this._objectIdSchema.label('User id').default(userId)
    })

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }
}

export default new ReviewValidator()

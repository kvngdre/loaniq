import BaseValidator from './base.validator.js'
import Joi from 'joi'

class EmailTemplateValidator extends BaseValidator {
  #nameSchema
  #templateNameSchema
  #subjectSchema
  #htmlSchema

  constructor () {
    super()

    this.#nameSchema = Joi.string().lowercase().trim().label('Name')
    this.#templateNameSchema = Joi.string()
      .lowercase()
      .trim()
      .label('Template name')
    this.#subjectSchema = Joi.string().label('Subject')
    this.#htmlSchema = Joi.string().label('Html')
  }

  validateCreate = (newTemplateDTO) => {
    const schema = Joi.object({
      name: this.#nameSchema.required(),
      templateName: this.#templateNameSchema.required(),
      subject: this.#subjectSchema.required(),
      html: this.#htmlSchema.required()
    })

    let { value, error } = schema.validate(newTemplateDTO, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }

  validateUpdate = (updateTemplateDTO) => {
    const schema = Joi.object({
      name: this.#nameSchema,
      templateName: this.#templateNameSchema,
      subject: this.#subjectSchema,
      html: this.#htmlSchema
    })

    let { value, error } = schema.validate(updateTemplateDTO, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }
}

export default new EmailTemplateValidator()

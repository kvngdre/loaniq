import Joi from 'joi';
import BaseValidator from './base.validator.js';

class SegmentValidator extends BaseValidator {
  #nameSchema;

  #codeSchema;

  #prefixSchema;

  constructor() {
    super();

    this.#nameSchema = Joi.string()
      .trim()
      .label('Segment name')
      .max(255)
      .messages({
        'string.max': 'Segment name is too long',
      });

    this.#codeSchema = Joi.string()
      .label('Segment code')
      .trim()
      .pattern(/^[a-zA-Z]{2,5}$/)
      .messages({
        'string.pattern.base': '{#label} is not valid',
      });

    this.#prefixSchema = Joi.string()
      .label('ID prefix')
      .trim()
      .pattern(/[a-zA-Z]{2,8}/)
      .messages({
        'string.pattern.base': '{#label} is not valid',
      });
  }

  validateCreate = (dto) => {
    const schema = Joi.object({
      code: this.#codeSchema.required(),
      name: this.#nameSchema.required(),
      id_prefix: this.#prefixSchema.required(),
      active: this._activeSchema,
      recommendation: Joi.object({
        max_age: this._ageSchema.label('Max age').max(60),
        max_tenure: this._tenorSchema.label('Max tenure'),
        min_income: this._amountSchema.label('Min income'),
      }),
    });

    let { value, error } = schema.validate(dto, {
      abortEarly: false,
      convert: false,
    });
    error = this._refineError(error);

    return { value, error };
  };

  validateUpdate = (dto) => {
    const schema = Joi.object({
      code: this.#codeSchema,
      name: this.#nameSchema,
      id_prefix: this.#prefixSchema,
      active: this._activeSchema,
      recommendation: Joi.object({
        max_age: this._ageSchema.label('Max age').max(60),
        max_tenure: this._tenorSchema.label('Max tenure'),
        min_income: this._amountSchema.label('Min income'),
      }),
    });

    let { value, error } = schema.validate(dto, {
      abortEarly: false,
      convert: false,
    });
    error = this._refineError(error);

    return { value, error };
  };
}

export default new SegmentValidator();

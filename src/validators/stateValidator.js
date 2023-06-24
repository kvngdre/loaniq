import Joi from 'joi';
import { geoZones } from '../utils/common.js';
import BaseValidator from './base.validator.js';

class StateValidator extends BaseValidator {
  #codeSchema;

  #nameSchema;

  #lgaSchema;

  #regionSchema;

  constructor() {
    super();

    this.#codeSchema = Joi.string()
      .trim()
      .label('Code')
      .pattern(/^[a-zA-Z]{2}$/)
      .messages({
        'string.pattern.base': '{#label} is not valid',
      });

    this.#nameSchema = Joi.string().trim().label('Name');

    this.#lgaSchema = Joi.array().items(Joi.string().trim()).label('LGAs');

    this.#regionSchema = Joi.string()
      .valid(...geoZones)
      .label('Geo');
  }

  validateCreate = (dto) => {
    const schema = Joi.object({
      code: this.#codeSchema.required(),
      name: this.#nameSchema.required(),
      lgas: this.#lgaSchema.required(),
      geo: this.#regionSchema.required(),
    });

    let { value, error } = schema.validate(dto, { abortEarly: false });
    error = this._refineError(error);

    return { value, error };
  };

  validateUpdate = (dto) => {
    const schema = Joi.object({
      code: this.#codeSchema,
      name: this.#nameSchema,
      lgas: this.#lgaSchema,
      geo: this.#regionSchema,
    });

    let { value, error } = schema.validate(dto, { abortEarly: false });
    error = this._refineError(error);

    return { value, error };
  };
}

export default new StateValidator();

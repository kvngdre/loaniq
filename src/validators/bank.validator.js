import Joi from "joi";
import BaseValidator from "./base.validator.js";

class BankValidator extends BaseValidator {
  #nameSchema;

  #codeSchema;

  constructor() {
    super();

    this.#nameSchema = Joi.string().label("Name").trim().min(8).max(20);
    this.#codeSchema = Joi.string()
      .min(3)
      .max(6)
      .pattern(/^[0-9]{3,6}$/)
      .messages({
        "string.min": "{#label} is not valid",
        "string.max": "{#label} is not valid",
        "string.pattern.base": "{#label} is not valid",
      });
  }

  validateCreate = (dto) => {
    const schema = Joi.object({
      name: this.#nameSchema.required(),
      code: this.#codeSchema.required(),
    });

    let { value, error } = schema.validate(dto, { abortEarly: false });
    error = this._refineError(error);

    return { value, error };
  };

  validateUpdate = (dto) => {
    const schema = Joi.object({
      name: this.#nameSchema,
      code: this.#codeSchema,
    }).min(1);

    let { value, error } = schema.validate(dto, { abortEarly: false });
    error = this._refineError(error);

    return { value, error };
  };
}

export default new BankValidator();

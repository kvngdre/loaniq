import Joi from 'joi';
import { Types } from 'mongoose';
import { roles } from '../config/roles.js';
import ForbiddenError from '../errors/forbidden.error.js';
import { canUserResetPwd } from '../helpers/user.helpers.js';
import BaseValidator from './base.validator.js';

class UserValidator extends BaseValidator {
  #jobTitle;
  #displayNameSchema;
  #segmentsSchema;

  constructor() {
    super();

    this.#jobTitle = Joi.string().label('Job title').min(2).max(50).messages({
      'string.min': '{#label} is not valid',
      'string.max': '{#label} is too long',
    });

    this.#displayNameSchema = Joi.string()
      .label('Display name')
      .min(1)
      .max(255)
      .invalid('', ' ', '  ');

    this.#segmentsSchema = Joi.array()
      .items(this._objectIdSchema)
      .min(1)
      .messages({ 'array.min': '{#label} array cannot be empty' })
      .label('Segments');
  }

  validateCreateUser = (dto, tenantId) => {
    const newUserId = new Types.ObjectId();

    const schema = Joi.object({
      _id: Joi.any().default(newUserId).forbidden(),
      tenantId: this._objectIdSchema.label('Tenant id').default(tenantId),
      first_name: this._nameSchema.extract('first').required(),
      last_name: this._nameSchema.extract('last').required(),
      middle_name: this._nameSchema.extract('middle'),
      job_title: this.#jobTitle,
      dob: this._dateSchema.label('Date of birth').less('now'),
      display_name: this.#displayNameSchema.default((parent) => {
        return `${parent.first_name} ${parent.last_name}`;
      }),
      phone_number: this._phoneNumberSchema.required(),
      email: this._emailSchema.required(),
      role: this._objectIdSchema.required(),
      segments: this.#segmentsSchema.when('role', {
        is: roles.AGENT,
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
    });

    let { value, error } = schema.validate(dto, { abortEarly: false });
    error = this._refineError(error);

    return { value, error };
  };

  validateVerifySignUp = (dto) => {
    const schema = Joi.object({
      email: this._emailSchema.required(),
      otp: this._otpSchema(8),
      current_password: Joi.string().trim().label('Current password'),
      new_password: this._passwordSchema(8).label('New password'),
      confirm_password: this._confirmPasswordSchema,
    })
      .xor('otp', 'current_password')
      .with('current_password', ['new_password', 'confirm_password'])
      .without('otp', ['current_password', 'new_password', 'confirm_password']);

    let { value, error } = schema.validate(dto, { abortEarly: false });
    error = this._refineError(error);

    return { value, error };
  };

  validateUpdate = (dto) => {
    const schema = Joi.object({
      first_name: this._nameSchema.extract('first'),
      last_name: this._nameSchema.extract('last'),
      middle_name: this._nameSchema.extract('middle'),
      job_title: this.#jobTitle,
      dob: this._dateSchema.label('Date of birth').less('now'),
      display_name: this.#displayNameSchema,
      role: this._roleSchema.invalid(roles.DIRECTOR),
      segments: this.#segmentsSchema.when('role', {
        is: roles.AGENT,
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
      }),
    }).min(1);

    let { value, error } = schema.validate(dto, { abortEarly: false });
    error = this._refineError(error);

    return { value, error };
  };

  validateDeactivation = (dto) => {
    const schema = Joi.object({
      password: Joi.string().label('Password').max(255).required(),
    });

    let { value, error } = schema.validate(dto);
    error = this._refineError(error);

    return { value, error };
  };

  validateUpdatePassword = (dto) => {
    const schema = Joi.object({
      current_password: Joi.string().label('Current password').required(),
      new_password: this._passwordSchema(8).required(),
      confirm_password: this._confirmPasswordSchema.required(),
    });

    let { value, error } = schema.validate(dto, { abortEarly: false });
    error = this._refineError(error);

    return { value, error };
  };

  validateForgotPassword = async (dto) => {
    let schema = Joi.object()
      .keys({
        email: this._emailSchema.required(),
      })
      .min(1);
    let { value, error } = schema.validate(dto, { abortEarly: false });

    if (error) {
      error = this._refineError(error);
      return { value, error };
    }

    const canReset = await canUserResetPwd(value.email);
    if (!canReset) {
      throw new ForbiddenError(
        "You can't reset your own password. If you can't sign in, you need to contact your administrator to reset your password for you.",
      );
    }

    schema = schema.keys({
      new_password: this._passwordSchema(8).required(),
      confirm_password: this._confirmPasswordSchema.required(),
      canReset: Joi.boolean().default(canReset),
    });

    const result = schema.validate(dto, { abortEarly: false });
    result.error = this._refineError(result.error);

    return result;
  };
}

export default new UserValidator();

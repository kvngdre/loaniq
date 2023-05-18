import Joi from 'joi';
import { Types } from 'mongoose';
import {
  companyCategory,
  socials,
  TenantStatus,
  VALID_ID,
} from '../utils/common.js';
import BaseValidator from '../validators/base.validator.js';
class TenantValidator extends BaseValidator {
  #companyNameSchema;
  #cacNumberSchema;
  #categorySchema;
  #socialSchema;
  #supportSchema;
  #allowUserPwdResetSchema;
  #idTypeSchema;
  #idSchema;
  #documentationSchema;

  constructor() {
    super();

    this.#companyNameSchema = Joi.string()
      .label('Business name')
      .min(2)
      .max(255)
      .lowercase()
      .messages({
        'string.min': '{#label} is not valid',
        'string.max': '{#label} is too long',
      });

    this.#cacNumberSchema = Joi.string()
      .label('CAC number')
      .pattern(/^RC[\d]{3,8}$/)
      .invalid('RC0000', 'RC000')
      .messages({
        'any.invalid': '{#label} is not valid',
        'string.pattern.base': '{#label} must begin with "RC"',
      });

    this.#categorySchema = Joi.string()
      .lowercase()
      .label('Category')
      .valid(...companyCategory)
      .messages({ 'any.only': 'Not a valid category' });

    this.#socialSchema = Joi.array().items(
      Joi.object({
        platform: Joi.string()
          .lowercase()
          .label('Platform')
          .trim()
          .valid(...socials)
          // .messages({ 'any.only': '{#label} is not supported' })
          .required(),
        url: Joi.string()
          .label('URL')
          .trim()
          .custom((value, helpers) => {
            try {
              const regex = /^www\./;
              if (regex.test(value)) value = 'https://' + value;

              const url = new URL(value);
              if (url.protocol !== 'https:') return helpers.error('any.only');

              return url.href;
            } catch (error) {
              return helpers.error('any.invalid');
            }
          })
          .messages({
            'any.only': 'Must be a secure {#label}',
            'any.invalid': '{#label} is invalid',
          })
          .required(),
      }),
    );

    this.#idTypeSchema = Joi.string()
      .lowercase()
      .label('Id type')
      .valid(...VALID_ID.filter((id) => id !== 'staff id card'));

    this.#idSchema = Joi.string().alphanum().trim().uppercase().messages({
      'string.pattern.base': 'Invalid staff id number',
    });

    this.#supportSchema = Joi.object({
      email: this._emailSchema.label('Support email'),
      phone_number: this._phoneNumberSchema.label('Support phone number'),
    })
      .min(1)
      .label('Support');

    this.#allowUserPwdResetSchema = Joi.boolean()
      .label('Allow user password reset')
      .default(false);

    this.#documentationSchema = Joi.array()
      .items(
        Joi.object({
          name: Joi.string().lowercase().label('Document name').required(),
          url: Joi.string().label('Document url').required(),
          expires: Joi.date().iso().optional(),
        }),
      )
      .label('Documentation');
  }

  validateSignUp = (dto) => {
    const tenantId = new Types.ObjectId();
    const tenantConfigurationId = new Types.ObjectId();
    const userId = new Types.ObjectId();
    const adminRoleId = new Types.ObjectId();

    const schema = Joi.object({
      newTenantDto: Joi.object({
        _id: Joi.any().default(tenantId).forbidden(),
        business_name: this.#companyNameSchema.required(),
        status: Joi.string().default(TenantStatus.ONBOARDING).forbidden(),
        configurations: Joi.any().default(tenantConfigurationId).forbidden(),
      }).required(),
      newUserDto: Joi.object({
        _id: Joi.any().default(userId).forbidden(),
        first_name: this._nameSchema.extract('first').required(),
        last_name: this._nameSchema.extract('last').required(),
        email: this._emailSchema.required(),
        phone_number: this._phoneNumberSchema.required(),
        new_password: this._passwordSchema(8).required(),
        confirm_password: this._confirmPasswordSchema.strip().required(),
        role: Joi.any().default(adminRoleId).forbidden(),
        configurations: Joi.object()
          .keys({
            ja: 'kk',
            password: Joi.string().default(Joi.ref('new_password')),
            resetPwd: Joi.boolean().default(false),
            otp: Joi.object({
              pin: Joi.string().default(''),
              expiresIn: Joi.number().default(0),
            }),
          })
          .forbidden(),
      }).required(),
    });

    let { value, error } = schema.validate(dto, {
      abortEarly: false,
      presence: 'optional',
    });
    if (error !== undefined) error = this._refineError(error);

    return { value, error };
  };

  validateUpdate = (dto) => {
    const schema = Joi.object({
      logo: Joi.string().label('logo'),
      business_name: this.#companyNameSchema,
      address: this._locationSchema.extract('address'),
      state: this._locationSchema.extract('state'),
      email: this._emailSchema,
      phone_number: this._phoneNumberSchema,
    }).min(1);

    let { value, error } = schema.validate(dto, { abortEarly: false });
    if (error !== undefined) error = this._refineError(error);

    return { value, error };
  };

  validateOnBoarding = (dto) => {
    const schema = Joi.object({
      logo: Joi.string().label('logo'),
      business_name: this.#companyNameSchema.required(),
      category: this.#categorySchema.required(),
      cac_number: this.#cacNumberSchema.required(),
      email: this._emailSchema.required(),
    });

    let { value, error } = schema.validate(dto, { abortEarly: false });
    if (error !== undefined) error = this._refineError(error);

    return { value, error };
  };

  validateActivationRequest = (dto) => {
    const schema = Joi.object({
      logo: Joi.string().label('logo'),
      business_name: this.#companyNameSchema.required(),
      category: this.#categorySchema.required(),
      cac_number: this.#cacNumberSchema.required(),
      email: this._emailSchema.required(),
      phone_number: this._phoneNumberSchema,
      address: this._locationSchema.extract('address').required(),
      state: this._locationSchema.extract('state').required(),
      support: this.#supportSchema.required(),
      documentation: this.#documentationSchema.required(),
    });

    let { value, error } = schema.validate(dto, { abortEarly: false });
    if (error !== undefined) error = this._refineError(error);

    return { value, error };
  };

  validateDeactivationRequest = (dto) => {
    const schema = Joi.object({
      otp: this._otpSchema(8),
    });

    let { value, error } = schema.validate(dto, { abortEarly: false });
    if (error !== undefined) error = this._refineError(error);

    return { value, error };
  };
}

export default new TenantValidator();

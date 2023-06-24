import Joi from 'joi';
import { Types } from 'mongoose';
import {
  CompanyCategory,
  SocialPlatform,
  TenantStatus,
} from '../utils/common.js';
import { ValidId } from '../utils/constants.utils.js';
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

    this.#allowUserPwdResetSchema = Joi.boolean()
      .label('Allow user password reset')
      .default(false);

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
      .valid(...Object.values(CompanyCategory))
      .messages({ 'any.only': 'Not a valid category' });

    this.#companyNameSchema = Joi.string()
      .label('Company name')
      .min(2)
      .max(255)
      .lowercase()
      .messages({
        'string.min': '{#label} is not valid',
        'string.max': '{#label} is too long',
      });

    this.#documentationSchema = Joi.array()
      .items(
        Joi.object({
          name: Joi.string().lowercase().label('Document name').required(),
          url: Joi.string().label('Document url').required(),
          expires: Joi.date().iso().optional(),
        }),
      )
      .label('Documentation');

    this.#idSchema = Joi.string().alphanum().trim().uppercase().messages({
      'string.pattern.base': 'Invalid staff id number',
    });

    this.#idTypeSchema = Joi.string()
      .lowercase()
      .label('Id type')
      .valid(
        ...Object.values(ValidId).filter((value) => value !== ValidId.STAFF_ID),
      );

    this.#socialSchema = Joi.array().items(
      Joi.object({
        platform: Joi.string()
          .lowercase()
          .label('Platform')
          .trim()
          .valid(...Object.values(SocialPlatform))
          // .messages({ 'any.only': '{#label} is not supported' })
          .required(),
        link: Joi.string()
          .label('link')
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

    this.#supportSchema = Joi.object({
      email: this._emailSchema.label('Support email'),
      phone_number: this._phoneNumberSchema.label('Support phone number'),
    })
      .min(1)
      .label('Support');
  }

  /**
   * Validates the sign up request payload and appends default values.
   * @param {*} dto
   * @returns {{ value: import('./dto/sign-up.dto.js').SignUpDto, error: (Object.<string, string>|undefined)}}
   */
  validateSignUp = (dto) => {
    const tenantId = new Types.ObjectId();
    const userId = new Types.ObjectId();
    const adminRoleId = new Types.ObjectId();

    const schema = Joi.object({
      newTenantDto: Joi.object({
        _id: Joi.any().default(tenantId).forbidden(),
        business_name: this.#companyNameSchema.required(),
        status: Joi.string().default(TenantStatus.ONBOARDING).forbidden(),
      }).required(),
      newUserDto: Joi.object({
        _id: Joi.any().default(userId).forbidden(),
        first_name: this._nameSchema.extract('first').required(),
        last_name: this._nameSchema.extract('last').required(),
        email: this._emailSchema.required(),
        phone_number: this._phoneNumberSchema.required(),
        new_password: this._passwordSchema(8).strip().required(),
        confirm_password: this._confirmPasswordSchema.strip().required(),
        role: Joi.any().default(adminRoleId).forbidden(),
        configurations: Joi.object({
          password: Joi.string().default(Joi.ref('...new_password')),
          isToResetPassword: Joi.boolean().default(false),
          otp: Joi.object().default({}),
        }).default(),
      }).required(),
    });

    let { value, error } = schema.validate(dto, { abortEarly: false });
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

  validateRequestActivation = (dto) => {
    const schema = Joi.object({
      logo: Joi.string().label('logo'),
      business_name: this.#companyNameSchema,
      address: this._locationSchema.extract('address').required(),
      state: this._stateSchema.required(),
      cac_number: this.#cacNumberSchema.required(),
      category: this.#categorySchema.required(),
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

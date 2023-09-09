import Joi from "joi";

import { companyCategory, socials, VALID_ID } from "../../utils/common.js";
import {
  BaseValidator,
  businessNameSchema,
  locationSchema,
} from "./lib/common.js";

class TenantValidator extends BaseValidator {
  #companyNameSchema;

  #cacNumberSchema;

  #categorySchema;

  #socialSchema;

  #supportSchema;

  #idTypeSchema;

  #idSchema;

  #documentationSchema;

  constructor() {
    super();

    this.#companyNameSchema = Joi.string()
      .label("Company name")
      .min(2)
      .max(255)
      .lowercase()
      .messages({
        "string.min": "{#label} is not valid",
        "string.max": "{#label} is too long",
      });

    this.#cacNumberSchema = Joi.string()
      .label("CAC number")
      .pattern(/^RC[\d]{3,8}$/)
      .invalid("RC0000", "RC000")
      .messages({
        "any.invalid": "{#label} is not valid",
        "string.pattern.base": '{#label} must begin with "RC"',
      });

    this.#categorySchema = Joi.string()
      .lowercase()
      .label("Category")
      .valid(...companyCategory)
      .messages({ "any.only": "Not a valid category" });

    this.#socialSchema = Joi.array().items(
      Joi.object({
        platform: Joi.string()
          .lowercase()
          .label("Platform")
          .trim()
          .valid(...socials)
          // .messages({ 'any.only': '{#label} is not supported' })
          .required(),
        url: Joi.string()
          .label("URL")
          .trim()
          .custom((value, helpers) => {
            try {
              const regex = /^www\./;
              let formattedValue;
              if (regex.test(value)) formattedValue = `https://${value}`;

              const url = new URL(formattedValue);
              if (url.protocol !== "https:") return helpers.error("any.only");

              return url.href;
            } catch (error) {
              return helpers.error("any.invalid");
            }
          })
          .messages({
            "any.only": "Must be a secure {#label}",
            "any.invalid": "{#label} is invalid",
          })
          .required(),
      }),
    );

    this.#idTypeSchema = Joi.string()
      .lowercase()
      .label("Id type")
      .valid(...VALID_ID);

    this.#idSchema = Joi.string().alphanum().trim().uppercase().messages({
      "string.pattern.base": "Invalid staff id number",
    });

    this.#supportSchema = Joi.object({
      email: this.emailSchema.label("Support email"),
      phoneNo: this.phoneNumberSchema.label("Support phone number"),
    })
      .min(1)
      .label("Support");

    this.#documentationSchema = Joi.array()
      .items(
        Joi.object({
          name: Joi.string().lowercase().label("Document name").required(),
          url: Joi.string().label("Document url").required(),
          expires: Joi.date().iso().optional(),
        }),
      )
      .label("Documentation");
  }

  validateUpdate = (dto) => {
    const schema = Joi.object({
      logo: Joi.string().label("logo"),
      business_name: this.#companyNameSchema,
      address: this.locationSchema.extract("address"),
      state: this.locationSchema.extract("state"),
      email: this.emailSchema,
      phone_no: this.phoneNumberSchema,
    }).min(1);

    let { value, error } = schema.validate(dto, { abortEarly: false });
    error = this.refineError(error);

    return { value, error };
  };

  validateOnBoarding = (onBoardTenantDTO) => {
    const schema = Joi.object({
      logo: Joi.string().label("logo"),
      businessname: this.#companyNameSchema.required(),
      category: this.#categorySchema.required(),
      cacnumber: this.#cacNumberSchema.required(),
      email: this.emailSchema.required(),
    });

    let { value, error } = schema.validate(onBoardTenantDTO, {
      abortEarly: false,
    });
    error = this.refineError(error);

    return { value, error };
  };

  validateActivationRequest = (activateTenantDTO) => {
    const schema = Joi.object({
      logo: Joi.string().label("logo"),
      businessname: this.#companyNameSchema.required(),
      category: this.#categorySchema.required(),
      cacnumber: this.#cacNumberSchema.required(),
      email: this.emailSchema.required(),
      phonenumber: this.phoneNumberSchema,
      address: this.locationSchema.extract("address").required(),
      state: this.locationSchema.extract("state").required(),
      support: this.#supportSchema.required(),
      documentation: this.#documentationSchema.required(),
    });

    let { value, error } = schema.validate(activateTenantDTO, {
      abortEarly: false,
    });
    error = this.refineError(error);

    return { value, error };
  };

  validateDeactivationRequest = (dto) => {
    const schema = Joi.object({
      otp: this.otpSchema(8),
    });

    let { value, error } = schema.validate(dto, { abortEarly: false });
    error = this.refineError(error);

    return { value, error };
  };
}

export const tenantValidator = new TenantValidator();

export const updateTenantValidator = Joi.object({
  logo: Joi.string().uri().label("Logo"),
  businessName: businessNameSchema,
  address: locationSchema.extract("address"),
  state: locationSchema.extract("state"),
}).min(1);

import Joi from "joi";
import { joiPassword } from "joi-password";

import { feeTypes } from "../../../utils/common.js";
import {
  MARITAL_STATUS,
  SOCIALS,
  VALID_ID,
} from "../../../utils/helpers/index.js";

export class BaseValidator {
  constructor() {
    this.accountNumberSchema = Joi.string()
      .pattern(/^[0-9]{10}$/)
      .messages({
        "string.pattern.base": "Invalid account number.",
        "any.required": "Account number is required",
      });

    this.activeSchema = Joi.boolean().label("Active").messages({
      "any.invalid": "Must be a boolean value",
    });

    this.ageSchema = Joi.number().min(18);

    this.amountSchema = Joi.number()
      .label("Loan amount")
      .min(0)
      .max(9999999.99)
      .precision(2);

    this.confirmPasswordSchema = Joi.string()
      .label("Confirm password")
      .trim()
      .equal(Joi.ref("password"))
      .messages({ "any.only": "Passwords do not match" });

    this.dateSchema = Joi.date().iso();

    this.descriptionSchema = Joi.string()
      .label("Description")
      .trim()
      .lowercase()
      .max(100);

    this.emailSchema = Joi.string()
      .email()
      .trim()
      .lowercase()
      .label("Email")
      .messages({
        "string.email": "Invalid email",
      });

    this.percentageSchema = Joi.number()
      .label("Interest rate")
      .min(0)
      .max(100.0)
      .precision(2);

    this.feesSchema = Joi.array()
      .label("Fees")
      .items(
        Joi.object({
          name: Joi.string()
            .lowercase()
            .max(50)
            .label("Fee name")
            .trim()
            .required(),
          type: Joi.number()
            .label("Fee type")
            .valid(...Object.values(feeTypes))
            .required(),
          value: Joi.when("type", {
            is: feeTypes.percent,
            then: this.percentageSchema.label("Fee value"),
            otherwise: this.amountSchema.label("Fee value"),
          }).required(),
        }),
      );

    this.formatErrorMessage = (message) => {
      // Regex to locate the appropriate space for inserting
      // commas in numbers in thousands or millions.
      const regex = /(?<!.*ISO \d)\B(?=(\d{3})+(?!\d))/g;

      // Remove quotation marks.
      let formattedMessage = `${message.replaceAll('"', "")}.`;

      // Insert comma to number if a number is present in the error message.
      formattedMessage = formattedMessage.replace(regex, ",");

      return formattedMessage;
    };

    this.genderSchema = Joi.string()
      .lowercase()
      .trim()
      .label("Gender")
      .valid("male", "female")
      .messages({
        "any.only": "Invalid gender",
      });

    this.idSchema = Joi.string().alphanum().trim().uppercase().messages({
      "string.pattern.base": "{#label} is not valid",
    });

    this.objectIdSchema = Joi.alternatives(
      Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({ "string.pattern.base": "Invalid object id" }),
      Joi.object().keys({
        id: Joi.any(),
        bsontype: Joi.allow("ObjectId"),
      }),
    );

    this.locationSchema = Joi.object({
      address: Joi.string()
        .lowercase()
        .max(100)
        .trim()
        .label("Address")
        .invalid(""),
      state: this.objectIdSchema.label("State"),
    });

    this.maritalSchema = Joi.string()
      .label("Marital status")
      .valid(...MARITAL_STATUS);

    this.nameSchema = Joi.string()
      .lowercase()
      .min(1)
      .max(128)
      .trim()
      .pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/)
      .messages({
        "string.min": "{#label} is too small",
        "string.max": "{#label} is too large",
        "string.pattern.base": "{#label} is invalid",
      });

    this.otpSchema = (len) =>
      Joi.string()
        .label("OTP")
        .trim()
        .pattern(new RegExp(`^[0-9]{${len}}$`))
        .messages({
          "string.pattern.base": "Invalid OTP",
        });

    this.passwordSchema = (len) =>
      joiPassword
        .string()
        .label("Password")
        .minOfUppercase(1)
        .minOfSpecialCharacters(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(len)
        .max(128)
        .messages({
          "password.minOfUppercase":
            "{#label} should contain at least {#min} uppercase character",
          "password.minOfSpecialCharacters":
            "{#label} should contain at least {#min} special character",
          "password.minOfNumeric":
            "{#label} should contain at least {#min} number",
          "password.noWhiteSpaces": "{#label} should not contain white spaces",
        });

    this.phoneNumberSchema = Joi.string()
      .label("Phone number")
      .trim()
      .length(13)
      .pattern(/^234\d{10}$/)
      .messages({
        "string.pattern.base":
          "{#label} is invalid, please include the international dialling code",
      });

    this.phoneOrStaffIdSchema = Joi.alternatives().try(
      this.phoneNumberSchema,
      this.idSchema,
    );

    this.refineError = (error) => {
      const reducer = (acc, value) => {
        if (acc === "") return acc + value;
        return `${acc}.${value}`;
      };

      const err = {};

      for (let i; i < error.details.length; i + 1) {
        const message = error.details[i];
        const key = error.details[i].path.reduce(reducer, "");

        err[key] = message;
      }

      return err;
    };

    this.roleSchema = Joi.string().label("Role").messages({
      "any.only": "{#label} is not valid",
      "any.invalid": "{#label} '{#value}', cannot be assigned to this user",
    });

    this.tenorSchema = Joi.number().label("Loan tenor").min(1).max(120);

    this.tenureSchema = Joi.number().positive().max(35);
  }
}

export const accountNumberSchema = Joi.string()
  .pattern(/^[0-9]{10}$/)
  .messages({
    "string.pattern.base": "Invalid account number.",
    "any.required": "Account number is required",
  });

export const activeSchema = Joi.boolean().label("Active").messages({
  "any.invalid": "Must be a boolean value",
});

export const ageSchema = Joi.number().min(18);

export const amountSchema = Joi.number()
  .label("Loan amount")
  .min(0)
  .max(9999999.99)
  .precision(2);

export const businessNameSchema = Joi.string()
  .label("Business name")
  .min(1)
  .max(255)
  .lowercase()
  .messages({
    "string.min": "{#label} is too short",
    "string.max": "{#label} is too long",
  });

export const confirmPasswordSchema = Joi.string()
  .label("Confirm password")
  .trim()
  .equal(Joi.ref("password"))
  .messages({ "any.only": "Passwords do not match" });

export const dateSchema = Joi.date().iso();

export const descriptionSchema = Joi.string()
  .label("Description")
  .trim()
  .lowercase()
  .max(100);

export const documentationSchema = Joi.array()
  .items(
    Joi.object({
      name: Joi.string().lowercase().label("Document name").required(),
      type: Joi.string().valid(),
      url: Joi.string().label("Document url").required(),
      expires: Joi.date().label("Document expiration date").iso().optional(),
    }),
  )
  .label("Documentation");

export const emailSchema = Joi.string()
  .email()
  .trim()
  .lowercase()
  .label("Email")
  .messages({
    "string.email": "Invalid email",
  });

export const percentageSchema = Joi.number()
  .label("Interest rate")
  .min(0)
  .max(100.0)
  .precision(2);

export const feesSchema = Joi.array()
  .label("Fees")
  .items(
    Joi.object({
      name: Joi.string()
        .lowercase()
        .max(50)
        .label("Fee name")
        .trim()
        .required(),
      type: Joi.number()
        .label("Fee type")
        .valid(...Object.values(feeTypes))
        .required(),
      value: Joi.when("type", {
        is: feeTypes.percent,
        then: percentageSchema.label("Fee value"),
        otherwise: amountSchema.label("Fee value"),
      }).required(),
    }),
  );

export const genderSchema = Joi.string()
  .lowercase()
  .trim()
  .label("Gender")
  .valid("male", "female")
  .messages({
    "any.only": "Invalid gender",
  });

export const idSchema = Joi.string().alphanum().trim().messages({
  "string.pattern.base": "{#label} is not valid",
});

export const idTypeSchema = Joi.string()
  .lowercase()
  .label("Id type")
  .valid(...VALID_ID);

export const ippisSchema = Joi.string().alphanum().uppercase().trim().messages({
  "string.pattern.base": "{#label} is not valid",
});

export const objectIdSchema = Joi.alternatives(
  Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({ "string.pattern.base": "Invalid object id" }),
  Joi.object().keys({
    id: Joi.any(),
    bsontype: Joi.allow("ObjectId"),
  }),
);

export const locationSchema = Joi.object({
  address: Joi.string()
    .lowercase()
    .max(100)
    .trim()
    .label("Address")
    .invalid(""),
  state: objectIdSchema.label("State"),
});

export const maritalSchema = Joi.string()
  .label("Marital status")
  .valid(...MARITAL_STATUS);

export const nameSchema = Joi.string()
  .lowercase()
  .min(1)
  .max(128)
  .trim()
  .pattern(/^[a-zA-Z]+([a-zA-Z]+)*$/)
  .messages({
    "string.min": "{#label} is invalid",
    "string.pattern.base": "{#label} is invalid",
  });

export const otpSchema = (len) =>
  Joi.string()
    .label("OTP")
    .trim()
    .pattern(new RegExp(`^[0-9]{${len}}$`))
    .messages({
      "string.pattern.base": "Invalid OTP",
    });

export const passwordSchema = (len) =>
  joiPassword
    .string()
    .label("Password")
    .minOfUppercase(1)
    .minOfSpecialCharacters(1)
    .minOfNumeric(1)
    .noWhiteSpaces()
    .min(len)
    .max(128)
    .messages({
      "password.minOfUppercase":
        "{#label} should contain at least {#min} uppercase character",
      "password.minOfSpecialCharacters":
        "{#label} should contain at least {#min} special character",
      "password.minOfNumeric": "{#label} should contain at least {#min} number",
      "password.noWhiteSpaces": "{#label} should not contain white spaces",
    });

export const phoneNumberSchema = Joi.string()
  .label("Phone number")
  .trim()
  .min(11)
  .max(15)
  .pattern(/^(\+?234|0)[789]\d{9}$/)
  .messages({
    "string.pattern.base": "{#label} is invalid",
  });

function formatErrorMessage(message) {
  // Regex to locate the appropriate space for inserting
  // commas in numbers in thousands or millions.
  const regex = /(?<!.*ISO \d)\B(?=(\d{3})+(?!\d))/g;

  // Remove quotation marks.
  let formattedMessage = `${message.replaceAll('"', "")}.`;

  // Insert comma to number if a number is present in the error message.
  formattedMessage = formattedMessage.replace(regex, ",");

  return formattedMessage;
}

export const refineError = (error) => {
  const reducer = (previousValue, currentValue) => {
    if (previousValue === "") return previousValue + currentValue;
    return `${previousValue}.${currentValue}`;
  };

  const err = {};

  for (let i = 0; i < error.details.length; i += 1) {
    const key = error.details[i].path.reduce(reducer, "");
    const message = formatErrorMessage(error.details[i].message);

    err[key] = message;
  }

  return err;
};

export const roleSchema = Joi.string().label("Role").messages({
  "any.only": "{#label} is not valid",
  "any.invalid": "{#label} '{#value}', cannot be assigned to this user",
});

export const supportSchema = Joi.object({
  email: emailSchema.label("Support email"),
  phone: phoneNumberSchema.label("Support phone number"),
})
  .min(1)
  .label("Support");

export const tenorSchema = Joi.number().label("Loan tenor").min(1).max(120);

export const tenureSchema = Joi.number().positive().max(35);

export const urlSchema = Joi.string()
  .lowercase()
  .label("URL")
  .trim()
  .custom((value, helpers) => {
    try {
      let baseUrl = "";
      const regex = /^www\./;
      if (regex.test(value)) baseUrl = `https://${value}`;

      const url = new URL(baseUrl);
      if (url.protocol !== "https:") return helpers.error("any.only");

      return url.href;
    } catch (error) {
      return helpers.error("any.invalid");
    }
  })
  .messages({
    "any.only": "Must be a secure {#label}",
    "any.invalid": "Invalid URL",
  });

export const socialSchema = Joi.array().items(
  Joi.object({
    platform: Joi.string()
      .lowercase()
      .label("Platform")
      .trim()
      .valid(...SOCIALS)
      // .messages({ 'any.only': '{#label} is not supported' })
      .required(),
    url: urlSchema.required(),
  }),
);

export const identificationSchema = Joi.array().items(
  Joi.object({
    name: nameSchema,
    type: idTypeSchema,
    url: urlSchema,
  }),
);

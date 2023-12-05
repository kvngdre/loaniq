import Joi from "joi";

import { TOKEN_TYPES } from "../../utils/helpers/token.helper.js";
import {
  emailSchema,
  makeConfirmPasswordSchema,
  makePasswordSchema,
  nameSchema,
  otpSchema,
} from "./lib/common-schemas.js";

export const signUpValidator = Joi.object({
  body: Joi.object({
    businessName: Joi.string().label("Business name").min(2).max(50).required(),
    firstName: nameSchema.label("First name").required(),
    lastName: nameSchema.label("Last name").required(),
    email: emailSchema.required(),
    password: makePasswordSchema(8).required(),
    confirmPassword: makeConfirmPasswordSchema().required(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

export const verifyRegistrationValidator = Joi.object({
  body: Joi.object({
    email: emailSchema.required(),
    token: otpSchema.label("Token").required(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

export const loginValidator = Joi.object({
  body: Joi.object({
    email: emailSchema.required(),
    password: Joi.string().max(128).label("Password").required(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

export const requestOtpValidator = Joi.object({
  body: Joi.object({
    email: emailSchema.required(),
    type: Joi.string()
      .lowercase()
      .trim()
      .valid(...Object.values(TOKEN_TYPES))
      .required(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

export const forgotPasswordValidator = Joi.object({
  body: Joi.object({
    email: emailSchema.required(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

export const resetPasswordWithVerificationValidator = Joi.object({
  body: Joi.object({
    email: emailSchema.required(),
    token: otpSchema.label("Token").required(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

export const resetPasswordWithoutVerificationValidator = Joi.object({
  body: Joi.object({
    email: emailSchema.required(),
    currentPassword: Joi.string().max(128).label("Current password").required(),
    newPassword: makePasswordSchema(8).label("New password").required(),
    confirmPassword: makeConfirmPasswordSchema("newPassword").required(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

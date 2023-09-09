import Joi from "joi";

import {
  confirmPasswordSchema,
  emailSchema,
  nameSchema,
  otpSchema,
  passwordSchema,
} from "./lib/common.js";

export const signUpValidator = Joi.object({
  body: Joi.object({
    businessName: Joi.string().label("Business name").min(2).max(50).required(),
    firstName: nameSchema.label("First name").required(),
    lastName: nameSchema.label("Last name").required(),
    email: emailSchema.required(),
    password: passwordSchema(8).required(),
    confirmPassword: confirmPasswordSchema.required(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

export const verifyValidator = Joi.object({
  query: Joi.object({ email: emailSchema.required() }),
  params: Joi.object({}),
  body: Joi.object({ otp: otpSchema(6) }),
});

export const loginValidator = Joi.object({
  body: Joi.object({
    email: emailSchema.required(),
    password: Joi.string().max(50).label("Password").required(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

export const requestOtpValidator = Joi.object({
  body: Joi.object({
    email: emailSchema,
    type: Joi.string().lowercase().trim().valid("verify", "password"),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

import Joi from "joi";

import { descriptionSchema, objectIdSchema } from "./lib/common-schemas.js";

export const createEmailTemplateValidator = Joi.object({
  body: Joi.object({
    name: Joi.string()
      .label("Name")
      .min(1)
      .max(50)
      .lowercase()
      .trim()
      .required(),
    description: descriptionSchema,
    type: Joi.string(),
    subject: Joi.string().label("Subject").min(1).max(50).trim().required(),
    body: Joi.string().label("Body").required(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

export const editEmailTemplateValidator = Joi.object({
  body: Joi.object({
    name: Joi.string().label("Name").min(1).max(50).lowercase().trim(),
    description: descriptionSchema,
    type: Joi.string(),
    subject: Joi.string().label("Subject").min(1).max(50).trim(),
    body: Joi.string().label("Body"),
  }),
  query: Joi.object({}),
  params: Joi.object({
    id: objectIdSchema.required(),
  }),
});

export const emailTemplateIdValidator = Joi.object({
  body: Joi.object({}),
  query: Joi.object({}),
  params: Joi.object({
    id: objectIdSchema.required(),
  }),
});

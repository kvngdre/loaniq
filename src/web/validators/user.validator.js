import Joi from "joi";
// import { canUserResetPwd } from '../helpers/user.helpers.js';
import {
  BaseValidator,
  emailSchema,
  jobTitleSchema,
  makeConfirmPasswordSchema,
  makePasswordSchema,
  nameSchema,
  objectIdSchema,
  phoneNumberSchema,
} from "./lib/common-schemas.js";

class UserValidator extends BaseValidator {
  #jobTitle;

  #displayNameSchema;

  #segmentsSchema;

  constructor() {
    super();

    this.#jobTitle = Joi.string().label("Job title").min(2).max(50).messages({
      "string.min": "{#label} is not valid",
      "string.max": "{#label} is too long",
    });

    this.#displayNameSchema = Joi.string()
      .label("Display name")
      .min(1)
      .max(255)
      .invalid("", " ", "  ");

    this.#segmentsSchema = Joi.array()
      .items(this.objectIdSchema)
      .min(1)
      .messages({ "array.min": "{#label} array cannot be empty" })
      .label("Segments");
  }

  validateDeactivation = (dto) => {
    const schema = Joi.object({
      password: Joi.string().label("Password").max(255).required(),
    });

    let { value, error } = schema.validate(dto);
    error = this.refineError(error);

    return { value, error };
  };
}

export default new UserValidator();

export const createUserValidator = Joi.object({
  body: Joi.object({
    firstName: nameSchema.label("First name").required(),
    lastName: nameSchema.label("Last name").required(),
    jobTitle: jobTitleSchema,
    displayName: nameSchema.label("Display name"),
    phoneNumber: phoneNumberSchema,
    email: emailSchema.required(),
    role: objectIdSchema.required(),
    // segments:#segmentsSchema.when("role", {
    //   is: "agent",
    //   then: Joi.required(),
    //   otherwise: Joi.forbidden(),
    // }),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

export const updateUserValidator = Joi.object({
  body: Joi.object({
    firstName: nameSchema.label("First name"),
    lastName: nameSchema.label("Last name"),
    jobTitle: jobTitleSchema,
    displayName: nameSchema.label("Display name"),
    phoneNumber: phoneNumberSchema,
    role: objectIdSchema,
  }),
  query: Joi.object({}),
  params: Joi.object({
    id: objectIdSchema.required(),
  }),
});

export const changeUserPasswordValidator = Joi.object({
  body: Joi.object({
    currentPassword: Joi.string().label("Current password").required(),
    newPassword: makePasswordSchema(8).label("New password").required(),
    confirmPassword: makeConfirmPasswordSchema("newPassword").required(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

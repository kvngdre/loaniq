import Joi from "joi";
// import { canUserResetPwd } from '../helpers/user.helpers.js';
import {
  BaseValidator,
  emailSchema,
  jobTitleSchema,
  nameSchema,
  objectIdSchema,
  phoneNumberSchema,
} from "./lib/common.js";

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

  validateUpdate = (dto) => {
    const schema = Joi.object({
      firstname: this.nameSchema.extract("first"),
      lastname: this.nameSchema.extract("last"),
      middlename: this.nameSchema.extract("middle"),
      jobtitle: this.#jobTitle,
      dob: this.dateSchema.label("Date of birth").less("now"),
      displayname: this.#displayNameSchema,
      role: this.roleSchema.invalid(roles.DIRECTOR),
      segments: this.#segmentsSchema.when("role", {
        is: roles.AGENT,
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
      }),
    }).min(1);

    let { value, error } = schema.validate(dto, { abortEarly: false });
    error = this.refineError(error);

    return { value, error };
  };

  validateDeactivation = (dto) => {
    const schema = Joi.object({
      password: Joi.string().label("Password").max(255).required(),
    });

    let { value, error } = schema.validate(dto);
    error = this.refineError(error);

    return { value, error };
  };

  validateUpdatePassword = (dto) => {
    const schema = Joi.object({
      currentpassword: Joi.string().label("Current password").required(),
      newpassword: this.passwordSchema(8).required(),
      confirmpassword: this.confirmPasswordSchema.required(),
    });

    let { value, error } = schema.validate(dto, { abortEarly: false });
    error = this.refineError(error);

    return { value, error };
  };

  validateForgotPassword = async (dto) => {
    let schema = Joi.object()
      .keys({
        email: this.emailSchema.required(),
      })
      .min(1);
    let { value, error } = schema.validate(dto, { abortEarly: false });

    if (error) {
      error = this.refineError(error);
      return { value, error };
    }

    // const canReset = await canUserResetPwd(value.email);
    // if (!canReset) {
    //   throw new ForbiddenError(
    //     "You can't reset your own password. If you can't sign in, you need to contact your administrator to reset your password for you.",
    //   );
    // }

    schema = schema.keys({
      newpassword: this.passwordSchema(8).required(),
      confirmpassword: this.confirmPasswordSchema.required(),
      canReset: Joi.boolean().default(canReset),
    });

    const result = schema.validate(dto, { abortEarly: false });
    result.error = this.refineError(result.error);

    return result;
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

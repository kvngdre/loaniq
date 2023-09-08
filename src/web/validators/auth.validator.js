import Joi from "joi";

import { BaseValidator } from "./lib/base-validator.js";

class AuthValidator extends BaseValidator {
  registerSchema = Joi.object({
    body: Joi.object({
      businessName: Joi.string()
        .label("Business name")
        .min(2)
        .max(50)
        .required(),
      firstName: this.nameSchema.label("First name").required(),
      lastName: this.nameSchema.label("Last name").required(),
      email: this.emailSchema.required(),
      // phoneNo: this.phoneNumberSchema.required(),
      password: this.passwordSchema(8).required(),
      confirmPassword: this.confirmPasswordSchema.required(),
    }),
    query: Joi.object({}),
    params: Joi.object({}),
  });

  verifySchema = Joi.object({
    query: Joi.object({ email: this.emailSchema.required() }),
    params: Joi.object({}),
    body: Joi.object({ otp: this.otpSchema(6) }),
  });

  validateLogin = (loginDTO) => {
    let schema = Joi.object({
      email: this._emailSchema,
      phoneOrStaffId: this._phoneOrStaffIdSchema,
    })
      .xor("email", "phoneOrStaffId")
      .messages({
        "object.xor": "Value cannot contain both email and phoneOrStaffId",
      });

    if (loginDTO.email) {
      schema = schema.keys({
        password: Joi.string().max(50).label("Password").required(),
      });
    } else {
      schema = schema.keys({
        passcode: Joi.string().max(50).label("Passcode").required(),
      });
    }

    let { value, error } = schema.validate(loginDTO, { abortEarly: false });
    error = this._refineError(error);

    return { value, error };
  };

  validateSendOTP = (dto) => {
    const schema = Joi.object({
      email: this._emailSchema,
      phone: this._phoneNumberSchema,
      len: Joi.number().greater(5).less(9),
    })
      .xor("email", "phone")
      .messages({ "object.xor": "Value cannot contain both email and phone" });

    let { value, error } = schema.validate(dto, { abortEarly: false });
    error = this._refineError(error);

    return { value, error };
  };
}

export const authValidators = new AuthValidator();

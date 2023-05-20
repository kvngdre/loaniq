import { DateTime } from 'luxon';
// import { joiPassword } from 'joi-password'
import Joi from 'joi';
import { Relationship, ValidId } from '../utils/constants.utils.js';
import BaseValidator from './base.validator.js';

const isOver18 = (dob, helper) => {
  const dateEighteenYearsBack = DateTime.now().minus({ years: 18 });

  if (dateEighteenYearsBack >= dob) return dob;

  return helper.error('any.invalid');
};

const getInvalidPasscodes = (passcodeLength) => {
  const nums = [];
  const invalidPasscodes = ['123456', '654321'];
  for (let i = 0; i < 10; i++) {
    // convert the number to a string and appending to array
    nums.push(i.toString());
  }

  for (const num of nums) {
    // use the repeat method to create a new string with
    // x-number of copies of the original string and append to array
    invalidPasscodes.unshift(num.repeat(passcodeLength));
  }

  return invalidPasscodes;
};

class ClientValidator extends BaseValidator {
  #addressSchema;
  #birthDateSchema;
  #bvnSchema;
  #commandSchema;
  #hireDateSchema;
  #idTypeSchema;
  #relationshipSchema;
  #passcodeSchema;
  #confirm_passcode;

  constructor() {
    super();

    this.#bvnSchema = Joi.string()
      .label('BVN')
      .pattern(/^22[0-9]{9}$/)
      .messages({
        'string.pattern.base': '{#label} is not valid',
      });

    this.#birthDateSchema = Joi.date()
      .iso()
      .label('Birth date')
      .custom(isOver18)
      .less('now')
      .messages({ 'any.invalid': 'Must be 18 or older to apply' });

    this.#commandSchema = Joi.string().label('Command').lowercase().trim();

    this.#hireDateSchema = Joi.date()
      .iso()
      .label('Hire date')
      .min(
        Joi.ref('birth_date', {
          adjust: (doe) => {
            doe.setFullYear(doe.getFullYear() + 18);
            return doe;
          },
        }),
      )
      .less('now')
      .messages({
        'date.min': '{#label} is not valid',
      });

    this.#idTypeSchema = Joi.string()
      .label('Id type')
      .valid(...Object.values(ValidId));

    this.#relationshipSchema = Joi.string()
      .valid(...Object.values(Relationship))
      .label('Relationship');

    this.#addressSchema = Joi.string()
      .lowercase()
      .trim()
      .label('Address')
      .min(5)
      .max(100)
      .required()
      .messages({
        'string.min': '{#label} is too short.',
        'string.max': '{#label} is too long.',
      });

    this.#passcodeSchema = (len) => {
      return Joi.string()
        .label('Passcode')
        .trim()
        .invalid(...getInvalidPasscodes(len))
        .length(len)
        .pattern(/^\d{6}$/)
        .messages({
          'any.invalid': "We've seen that passcode too many times",
          'string.pattern.base': '{#label} is not valid. Must be 6 digits',
        });
    };

    this.#confirm_passcode = Joi.string()
      .label('Confirm pin')
      .trim()
      .equal(Joi.ref('passcode'))
      .messages({ 'any.only': 'Passcodes do not match' });
  }

  validateSignup = (clientSignupDTO) => {
    const schema = Joi.object({
      first_name: this._nameSchema.extract('first').required(),
      last_name: this._nameSchema.extract('last').required(),
      middle_name: this._nameSchema.extract('middle'),
      phone_number: this._phoneNumberSchema.required(),
      staff_id: this._idSchema.label('Staff id').required(),
      passcode: this.#passcodeSchema(6).required(),
      confirm_passcode: this.#confirm_passcode.required(),
    });

    let { value, error } = schema.validate(clientSignupDTO, {
      abortEarly: false,
    });
    error = this._refineError(error);

    return { value, error };
  };

  validateVerifySignup = (verifySignupDTO) => {
    const schema = Joi.object({
      phoneOrStaffId: this._phoneOrStaffIdSchema,
      otp: this._otpSchema(8),
    });

    let { value, error } = schema.validate(verifySignupDTO, {
      abortEarly: false,
    });
    error = this._refineError(error);

    return { value, error };
  };

  validateCreate = (newClientDTO) => {
    const schema = Joi.object({
      passport: Joi.string(),
      id_card: Joi.string(),
      first_name: this._nameSchema.extract('first').required(),
      last_name: this._nameSchema.extract('last').required(),
      middle_name: this._nameSchema.extract('middle'),
      gender: this._genderSchema.required(),
      birth_date: this.#birthDateSchema.required(),
      address: this.#addressSchema.required(),
      state: this._objectIdSchema.label('State').required(),
      phone_number: this._phoneNumberSchema.required(),
      email: this._emailSchema,
      marital_status: this._maritalSchema.required(),
      bvn: this.#bvnSchema.required(),
      staff_id: this._idSchema.label('staff id').required(),
      id_type: this.#idTypeSchema.required(),
      id_number: this._idSchema.label('Id number').required(),
      segment: this._objectIdSchema.label('Segment').required(),
      command: this.#commandSchema.required(),
      employer_address: this.#addressSchema
        .label('Employer address')
        .required(),
      employer_state: this._objectIdSchema.label('State').required(),
      hire_date: this.#hireDateSchema.required(),
      income: this._amountSchema.label('Income').required(),
      nok_full_name: this._nameSchema
        .extract('first')
        .label('Next of kin full name')
        .required(),
      nok_address: this.#addressSchema.label('Next of kin address').required(),
      nok_state: this._objectIdSchema.label('Next of kin state').required(),
      nok_phone_number: this._phoneNumberSchema
        .label('Next of kin phone number')
        .required(),
      nok_relationship: this.#relationshipSchema.required(),
      account_name: this._nameSchema
        .extract('last')
        .label('Salary account name')
        .required(),
      account_number: this._accountNumberSchema.required(),
      bank: this._objectIdSchema.label('Bank').required(),
    });

    let { value, error } = schema.validate(newClientDTO, { abortEarly: false });
    error = this._refineError(error);

    return { value, error };
  };

  validateUpdate = (updateClientDTO) => {
    const schema = Joi.object({
      passport: Joi.string(),
      id_card: Joi.string(),
      first_name: this._nameSchema.extract('first'),
      last_name: this._nameSchema.extract('last'),
      middle_name: this._nameSchema.extract('middle'),
      gender: this._genderSchema,
      birth_date: this.#birthDateSchema,
      address: this.#addressSchema,
      state: this._objectIdSchema.label('State'),
      phone_number: this._phoneNumberSchema,
      email: this._emailSchema,
      marital_status: this._maritalSchema,
      bvn: this.#bvnSchema,
      staff_id: this._idSchema.label('staff id'),
      id_type: this.#idTypeSchema,
      id_number: this._idSchema.label('Id number'),
      segment: this._objectIdSchema.label('Segment'),
      command: this.#commandSchema,
      employer_address: this.#addressSchema.label('Employer address'),
      employer_state: this._objectIdSchema.label('State'),
      hire_date: this.#hireDateSchema,
      income: this._amountSchema.label('Income'),
      nok_full_name: this._nameSchema
        .extract('first')
        .label('Next of kin full name'),
      nok_address: this.#addressSchema.label('Next of kin address'),
      nok_state: this._objectIdSchema.label('Next of kin state'),
      nok_phone_number: this._phoneNumberSchema.label(
        'Next of kin phone number',
      ),
      nok_relationship: this.#relationshipSchema,
      account_name: this._nameSchema
        .extract('last')
        .label('Salary account name'),
      account_number: this._accountNumberSchema,
      bank: this._objectIdSchema.label('Bank'),
    }).min(1);

    let { value, error } = schema.validate(updateClientDTO);
    error = this._refineError(error);

    return { value, error };
  };

  validateFilters = (filters) => {
    const schema = Joi.object({
      segment: this._objectIdSchema.label('Segment'),
      full_name: Joi.string()
        .trim()
        .label('Name')
        .pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/)
        .max(255)
        .messages({
          'string.pattern.base': '{#label} name is invalid',
        }),
    });

    let { value, error } = schema.validate(filters);
    error = this._refineError(error);

    return { value, error };
  };
}

export default new ClientValidator();

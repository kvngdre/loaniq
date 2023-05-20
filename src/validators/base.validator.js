import Joi from 'joi';
import { joiPassword } from 'joi-password';
import { roles } from '../config/roles.js';
import { feeTypes } from '../utils/common.js';
import { MaritalStatus } from '../utils/constants.utils.js';

class BaseValidator {
  #formatErrorMessage = (errorMessage) => {
    //  * Regex to locate the appropriate space for inserting commas in numbers.
    const regex = /(?<!.*ISO \d)\B(?=(\d{3})+(?!\d))/g;

    // * Remove quotation marks and insert comma to number found.
    return `${errorMessage.replaceAll('"', '').replace(regex, ',')}.`;
  };

  _refineError = (error) => {
    /**
     * This function joins the elements of the error path array.
     * Example: ['name', 'first'] becomes 'name.first'.
     * @param {string} accumulator
     * @param {string} nextValue
     * @returns {string}
     */
    const reducer = (accumulator, nextValue) => {
      if (accumulator === '') return accumulator + nextValue;
      return accumulator + '.' + nextValue;
    };

    const refinedError = {};
    for (const errorDetail of error.details) {
      refinedError[errorDetail.path.reduce(reducer, '')] =
        this.#formatErrorMessage(errorDetail.message);
    }

    return refinedError;
  };

  _objectIdSchema = Joi.alternatives(
    Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .messages({ 'string.pattern.base': 'Invalid object id' }),
    Joi.object().keys({
      id: Joi.any(),
      _bsontype: Joi.allow('ObjectId'),
    }),
  );

  _dateSchema = Joi.date().iso();

  _ageSchema = Joi.number().min(18);

  _tenureSchema = Joi.number().positive().max(35);

  _nameSchema = Joi.object({
    first: Joi.string()
      .lowercase()
      .min(2)
      .max(255)
      .trim()
      .label('First name')
      .pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/)
      .messages({
        'string.min': '{#label} is not valid',
        'string.max': '{#label} is too long',
        'string.pattern.base': '{#label} is invalid',
      }),
    last: Joi.string()
      .label('Last name')
      .lowercase()
      .min(2)
      .max(255)
      .trim()
      .pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/)
      .messages({
        'string.min': '{#label} is not valid',
        'string.max': '{#label} is too long',
        'string.pattern.base': '{#label} is invalid',
      }),
    middle: Joi.string()
      .label('Middle name')
      .lowercase()
      .min(1)
      .max(255)
      .trim()
      .pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/)
      .messages({
        'string.min': '{#label} is not valid',
        'string.max': '{#label} is too long',
        'string.pattern.base': '{#label} is invalid',
      }),
  });

  _genderSchema = Joi.string()
    .lowercase()
    .trim()
    .label('Gender')
    .valid('male', 'female')
    .messages({
      'any.only': 'Invalid gender',
    });

  _phoneNumberSchema = Joi.string()
    .label('Phone number')
    .trim()
    .min(11)
    .max(13)
    .pattern(/^234[7-9]\d{9}$|0[7-9][0-1]\d{8}/)
    .messages({
      'string.pattern.base': '{#label} is not valid',
    });

  _otpSchema = (len) => {
    return Joi.string()
      .label('OTP')
      .trim()
      .pattern(new RegExp(`^[0-9]{${len}}$`))
      .messages({
        'string.pattern.base': 'Invalid OTP',
      });
  };

  _emailSchema = Joi.string()
    .email()
    .trim()
    .lowercase()
    .label('Email')
    .messages({
      'string.email': '{#label} is  not valid',
    });

  _passwordSchema = (len) => {
    return joiPassword
      .string()
      .label('Password')
      .minOfUppercase(1)
      .minOfSpecialCharacters(1)
      .minOfNumeric(1)
      .noWhiteSpaces()
      .min(len)
      .max(255)
      .messages({
        'password.minOfUppercase':
          '{#label} should contain at least {#min} uppercase character',
        'password.minOfSpecialCharacters':
          '{#label} should contain at least {#min} special character',
        'password.minOfNumeric':
          '{#label} should contain at least {#min} number',
        'password.noWhiteSpaces': '{#label} should not contain white spaces',
      });
  };

  _confirmPasswordSchema = Joi.string()
    .label('Confirm password')
    .trim()
    .equal(Joi.ref('new_password'))
    .messages({ 'any.only': 'Passwords do not match' });

  _roleSchema = Joi.string()
    .label('Role')
    .valid(...Object.values(roles))
    .messages({
      'any.only': '{#label} is not valid',
      'any.invalid': "{#label} '{#value}', cannot be assigned to this user",
    });

  _locationSchema = Joi.object({
    address: Joi.string()
      .lowercase()
      .max(100)
      .trim()
      .label('Address')
      .invalid(''),
    state: this._objectIdSchema.label('State'),
  });

  _stateSchema = Joi.object({
    code: Joi.string().uppercase().length(2).label('Code'),
    name: Joi.string().label('Name'),
    lga: Joi.string().label('LGA'),
    geo: Joi.string().label('Geo'),
  });

  _idSchema = Joi.string().alphanum().trim().uppercase().messages({
    'string.pattern.base': '{#label} is not valid',
  });

  _activeSchema = Joi.boolean().label('Active').messages({
    'any.invalid': 'Must be a boolean value',
  });

  _amountSchema = Joi.number()
    .label('Loan amount')
    .min(0)
    .max(9999999.99)
    .precision(2);

  _tenorSchema = Joi.number().label('Loan tenor').min(1).max(120);

  _percentageSchema = Joi.number()
    .label('Interest rate')
    .min(0)
    .max(100.0)
    .precision(2);

  _feesSchema = Joi.array()
    .label('Fees')
    .items(
      Joi.object({
        name: Joi.string()
          .lowercase()
          .max(50)
          .label('Fee name')
          .trim()
          .required(),
        type: Joi.number()
          .label('Fee type')
          .valid(...Object.values(feeTypes))
          .required(),
        value: Joi.when('type', {
          is: feeTypes.percent,
          then: this._percentageSchema.label('Fee value'),
          otherwise: this._amountSchema.label('Fee value'),
        }).required(),
      }),
    );

  _maritalSchema = Joi.string()
    .label('Marital status')
    .valid(...Object.values(MaritalStatus));

  _accountNumberSchema = Joi.string()
    .pattern(/^[0-9]{10}$/)
    .messages({
      'string.pattern.base': 'Invalid account number.',
      'any.required': 'Account number is required',
    });

  _descSchema = Joi.string().label('Description').trim().lowercase().max(100);

  _phoneOrStaffIdSchema = Joi.alternatives().try(
    this._phoneNumberSchema,
    this._idSchema,
  );
}

export default BaseValidator;

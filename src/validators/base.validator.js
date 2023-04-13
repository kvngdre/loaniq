import { joiPassword } from 'joi-password'
import { feeTypes, maritalStatus } from '../utils/common.js'
import { roles } from '../config/index.js'
import Joi from 'joi'

class BaseValidator {
  #formatErrorMessage = (error) => {
    const regex = /(?<!.*ISO \d)\B(?=(\d{3})+(?!\d))/g
    const errorMsg = error.message

    // Remove quotation marks.
    let formattedMsg = `${errorMsg.replaceAll('"', '')}.`

    // Insert comma to number if a number is present in the error message.
    formattedMsg = formattedMsg.replace(regex, ',')

    return formattedMsg
  }

  _refineError = (error) => {
    // console.log(error.details[0])
    const reducer = (acc, value) => {
      if (acc === '') return acc + value
      return acc + '.' + value
    }

    if (error) {
      const _error = {}
      for (const detail of error.details) {
        _error[detail.path.reduce(reducer, '')] =
          this.#formatErrorMessage(detail)
      }

      return _error
    }

    return error
  }

  _objectIdSchema = Joi.alternatives(
    Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .messages({ 'string.pattern.base': 'Invalid object id' }),
    Joi.object().keys({
      id: Joi.any(),
      _bsontype: Joi.allow('ObjectId')
    })
  )

  _dateSchema = Joi.date().iso()

  _ageSchema = Joi.number().min(18)

  _tenureSchema = Joi.number().positive().max(35)

  _nameSchema = Joi.object({
    first: Joi.string()
      .lowercase()
      .min(2)
      .max(255)
      .trim()
      .label('First name')
      .messages({
        'string.min': '{#label} is not valid',
        'string.max': '{#label} is too long'
      }),
    last: Joi.string()
      .label('Last name')
      .lowercase()
      .min(2)
      .max(255)
      .trim()
      .messages({
        'string.min': '{#label} is not valid',
        'string.max': '{#label} is too long'
      }),
    middle: Joi.string()
      .label('Middle name')
      .lowercase()
      .min(2)
      .max(255)
      .trim()
      .messages({
        'string.min': '{#label} is not valid',
        'string.max': '{#label} is too long'
      })
  })

  _genderSchema = Joi.string()
    .label('Gender')
    .valid('male', 'female')
    .messages({
      'any.only': 'Invalid gender'
    })

  _phoneNumberSchema = Joi.string()
    .label('Phone number')
    .trim()
    .pattern(/^\+?[\d]{10,14}$/)
    .messages({
      'string.pattern.base':
        '{#label} is invalid, please include international dialling code.'
    })

  _otpSchema = (len) => {
    return Joi.string()
      .label('OTP')
      .trim()
      .pattern(new RegExp(`^[0-9]{${len}}$`))
      .messages({
        'string.pattern.base': 'Invalid OTP'
      })
  }

  _emailSchema = Joi.string()
    .email()
    .trim()
    .lowercase()
    .label('Email')
    .messages({
      'string.email': '{#label} is  not valid'
    })

  _passwordSchema = joiPassword
    .string()
    .label('Password')
    .minOfUppercase(1)
    .minOfSpecialCharacters(1)
    .minOfNumeric(1)
    .noWhiteSpaces()
    .min(6)
    .max(1024)
    .messages({
      'password.minOfUppercase':
        '{#label} should contain at least {#min} uppercase character',
      'password.minOfSpecialCharacters':
        '{#label} should contain at least {#min} special character',
      'password.minOfNumeric': '{#label} should contain at least {#min} number',
      'password.noWhiteSpaces': '{#label} should not contain white spaces'
    })

  _confirmPasswordSchema = Joi.string()
    .label('Confirm password')
    .trim()
    .equal(Joi.ref('new_password'))
    .messages({ 'any.only': 'Passwords do not match' })

  _roleSchema = Joi.string()
    .label('Role')
    .valid(...Object.values(roles))
    .messages({
      'any.only': '{#label} is not valid',
      'any.invalid': "{#label} '{#value}', cannot be assigned to this user"
    })

  _locationSchema = Joi.object({
    address: Joi.string().lowercase().max(100).trim().label('Address').invalid(''),
    state: this._objectIdSchema.label('State')
  })

  _activeSchema = Joi.boolean().label('Active').messages({
    'any.invalid': 'Must be a boolean value'
  })

  _amountSchema = Joi.number()
    .label('Loan amount')
    .min(0)
    .max(9999999.99)
    .precision(2)

  _tenorSchema = Joi.number().label('Loan tenor').min(1).max(120)

  _percentageSchema = Joi.number()
    .label('Interest rate')
    .min(0)
    .max(100.0)
    .precision(2)

  _feesSchema = Joi.array()
    .label('Fees')
    .items(
      Joi.object({
        name: Joi.string().lowercase().max(50).label('Fee name').trim().required(),
        type: Joi.number()
          .label('Fee type')
          .valid(...Object.values(feeTypes))
          .required(),
        value: Joi.when('type', {
          is: feeTypes.percent,
          then: this._percentageSchema.label('Fee value'),
          otherwise: this._amountSchema.label('Fee value')
        }).required()
      })
    )

  _maritalSchema = Joi.string()
    .label('Marital status')
    .valid(...maritalStatus)

  _accountNumberSchema = Joi.string()
    .pattern(/^[0-9]{10}$/)
    .messages({
      'string.pattern.base': 'Invalid account number.',
      'any.required': 'Account number is required'
    })

  _descSchema = Joi.string().label('Description').trim().lowercase().max(100)
}

export default BaseValidator

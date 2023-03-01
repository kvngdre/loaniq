import { joiPassword } from 'joi-password'
import { userRoles } from '../utils/userRoles'
import { feeTypes } from '../utils/constants'
import Joi from 'joi'

class BaseValidator {
  #formatErrorMessage = (error) => {
    const regex = /(?<!.*ISO \d)\B(?=(\d{3})+(?!\d))/g
    const errorMsg = error.details[0].message

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
      error = {
        message: this.#formatErrorMessage(error),
        path: error.details[0].path.reduce(reducer, '')
      }
    }

    return error
  }

  _objectIdSchema = Joi.alternatives(
    Joi.string().regex(/^[0-9a-fA-F]{24}$/),
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
      .label('First name')
      .trim()
      .min(2)
      .max(255)
      .trim()
      .messages({
        'string.min': '{#label} is not valid',
        'string.max': '{#label} is too long'
      }),
    last: Joi.string()
      .label('Last name')
      .trim()
      .min(2)
      .max(255)
      .trim()
      .messages({
        'string.min': '{#label} is not valid',
        'string.max': '{#label} is too long'
      }),
    middle: Joi.string()
      .label('Middle name')
      .trim()
      .min(2)
      .max(255)
      .trim()
      .messages({
        'string.min': '{#label} is not valid',
        'string.max': '{#label} is too long'
      })
  }).min(1)

  _genderSchema = Joi.string()
    .label('Gender')
    .valid('Male', 'Female')
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
    .uppercase()
    .valid(...Object.keys(userRoles))
    .messages({
      'any.only': '{#label} is not valid',
      'any.invalid': "{#label} '{#value}', cannot be assigned to this user"
    })

  _locationSchema = Joi.object({
    address: Joi.string().trim().label('Address').invalid('').messages({
      'any.invalid': '{#label} is required'
    }),
    lga: Joi.string().trim().label('LGA').invalid('').messages({
      'any.invalid': '{#label} is required'
    }),
    state: Joi.string().trim().label('State').invalid('').messages({
      'any.invalid': '{#label} is required'
    })
  })
    .min(1)
    .label('Location')

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

  _feesSchema = Joi.array().label('Fees').items(Joi.object({
    name: Joi.string().label('Fee name').trim().required(),
    type: Joi.number().label('Fee type').valid(...Object.values(feeTypes)).required(),
    value: Joi.when('type', {
      is: feeTypes.percent,
      then: this._percentageSchema.label('Fee value'),
      otherwise: this._amountSchema.label('Fee value')
    }).required()
  }))
}

export default BaseValidator

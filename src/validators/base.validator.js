import { joiPassword } from 'joi-password'
import Joi from 'joi'
import { userRoles } from '../utils/userRoles'
import { Types } from 'mongoose'

class BaseValidator {
  formatErrorMessage = (error) => {
    const regex = /(?<!.*ISO \d)\B(?=(\d{3})+(?!\d))/g
    const errorMsg = error.details[0].message

    // Remove quotation marks.
    let formattedMsg = `${errorMsg.replaceAll('"', '')}.`

    // Insert comma to number if a number is present in the error message.
    formattedMsg = formattedMsg.replace(regex, ',')

    return formattedMsg
  }

  _refineError = (error) => {
    console.log(error.details)
    if (error) {
      error = {
        message: this.formatErrorMessage(error),
        path: error.details[0].path.reduce((acc, value) => acc + '.' + value)
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

  _nameSchema = Joi.object({
    first: Joi.string().label('First name').min(2).max(255).trim().messages({
      'string.min': '{#label} is not valid',
      'string.max': '{#label} is too long'
    }),
    last: Joi.string().label('Last name').min(2).max(255).trim().messages({
      'string.min': '{#label} is not valid',
      'string.max': '{#label} is too long'
    }),
    middle: Joi.string().label('Middle name').min(2).max(255).trim().messages({
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
    .pattern(/^\+?[\d]{10,14}$/)
    .messages({
      'string.pattern.base':
        '{#label} is invalid, please include international dialling code.'
    })

  _otpSchema = Joi.string()
    .label('OTP')
    .pattern(/^[0-9]{6}$/)
    .messages({
      'string.pattern.base': 'Invalid OTP'
    })

  _emailSchema = Joi.string().email().label('Email').messages({
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
    .equal(Joi.ref('new_password'))
    .messages({ 'any.only': 'Passwords do not match' })

  _roleSchema = Joi.string()
    .label('Role')
    .uppercase()
    .custom((value, helpers) => {
      if (!Object.keys(userRoles).includes(value)) {
        return helpers.error('any.only')
      }

      console.log('-->', value)
      return userRoles[value]
    })
    .messages({
      'any.only': '{#label} is not valid',
      'any.invalid': "{#label} '{#value}', cannot be assigned to this user"
    })

  _locationSchema = Joi.object({
    address: Joi.string().invalid('').label('Address').messages({
      'any.invalid': '{#label} is required'
    }),
    lga: Joi.string().invalid('').label('LGA').messages({
      'any.invalid': '{#label} is required'
    }),
    state: Joi.string().invalid('').label('State').messages({
      'any.invalid': '{#label} is required'
    })
  })
    .min(1)
    .label('Location')

  _activeSchema = Joi.boolean().label('Active').messages({
    'any.invalid': 'Must be a boolean value'
  })

  _amountSchema = Joi.number().label('Loan amount').min(0).max(9999999.99).precision(2)

  _tenorSchema = Joi.number().label('Loan tenor').min(1).max(120)

  _percentageSchema = Joi.number().label('Interest rate').min(0).max(100.00).precision(2)
}

export default BaseValidator

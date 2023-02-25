import { joiPassword } from 'joi-password'
import { userRoles } from '../utils/constants'
import Joi from 'joi'

class BaseValidator {
  formatErrorMessage (error) {
    const regex = /\B(?=(\d{3})+(?!\d))/g
    const errorMsg = error.details[0].message

    // Remove quotation marks.
    let formattedMsg = `${errorMsg.replaceAll('"', '')}.`

    // Insert comma to number if a number is present in the error message.
    formattedMsg = formattedMsg.replace(regex, ',')

    return formattedMsg
  }

  _refineError = (error) => {
    if (error) {
      error = {
        message: this.formatErrorMessage(error),
        path: error.details[0].path.reduce((acc, value) => acc + '.' + value)
      }
    }

    return error
  }

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
  })

  _genderSchema = Joi.string().valid('Male', 'Female').messages({
    'any.only': 'Invalid gender',
    'any.required': 'Gender is required'
  })

  _dobSchema = Joi.date().label('Date of birth').less('now')

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
      'string.pattern.base': 'Invalid OTP',
      'any.required': 'OTP is required'
    })

  _emailSchema = Joi.string().email().label('Email').messages({
    'string.email': '{#label} is invalid',
    'any.required': '{#label} is required'
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

  _displayNameSchema = Joi.string().label('Display name').max(255)

  _roleSchema = Joi.string()
    .label('Role')
    .valid(...Object.values(userRoles))
}

export default BaseValidator

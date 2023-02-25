import { joiPassword } from 'joi-password'
import Joi from 'joi'

class BaseValidator {
  formatErrorMessage = (error) => {
    const regex = /\B(?=(\d{3})+(?!\d))/g
    const errorMsg = error.details[0].message

    // Remove quotation marks.
    let formattedMsg = `${errorMsg.replaceAll('"', '')}.`

    // Insert comma to number if a number is present in the error message.
    formattedMsg = formattedMsg.replace(regex, ',')

    error.details[0].message = formattedMsg
    return formattedMsg
  }

  _nameSchema = Joi.object({
    first: Joi.string()
      .min(2)
      .max(255)
      .messages({
        'string.min': 'Invalid first name.',
        'string.max': 'First name is too long',
        'any.required': 'First name is required'
      })
      .required(),
    last: Joi.string()
      .min(2)
      .max(255)
      .messages({
        'string.min': 'Invalid surname',
        'string.max': 'Surname is too long',
        'any.required': 'Surname is required'
      })
      .required(),
    middle: Joi.string().min(2).max(255).messages({
      'string.min': 'Invalid middle name',
      'string.max': 'Middle name is too long',
      'any.required': 'Middle name is required'
    })
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
      'string.pattern.base': 'Invalid OTP',
      'any.required': 'OTP is required'
    })

  _emailSchema = Joi.string().label('Email').email().messages({
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
}

export default BaseValidator

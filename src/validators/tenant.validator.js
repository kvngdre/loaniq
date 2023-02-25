import { companyCategory, socials } from '../utils/constants'
import BaseValidator from './base.validator'
import Joi from 'joi'

// const validators = {
//   validateUpdateTenantSettings: function (settings) {
//     const schema = Joi.object({
//       segment: Joi.object({
//         id: Joi.objectId().required(),
//         interestRate: Joi.number(),
//         minNetPay: Joi.number(),
//         minLoanAmount: Joi.number(),
//         maxLoanAmount: Joi.number(),
//         minTenor: Joi.number(),
//         maxTenor: Joi.number(),
//         maxDti: Joi.number(),
//         transferFee: Joi.number(),
//         upfrontFeePercent: Joi.number()
//       }),

//       defaultParams: Joi.object({
//         minLoanAmount: Joi.number(),
//         maxLoanAmount: Joi.number(),
//         minTenor: Joi.number(),
//         maxTenor: Joi.number(),
//         interestRate: Joi.number(),
//         upfrontFeePercent: Joi.number(),
//         transferFee: Joi.number(),
//         minNetPay: Joi.number(),
//         maxDti: Joi.number()
//       })
//     })

//     return schema.validate(settings)
//   },

//   fundAccount: function (payload) {
//     const schema = Joi.object({
//       amount: Joi.number().precision(2).min(500).required().messages({
//         'number.min': 'Minimum amount is 500.00.'
//       })
//     })

//     return schema.validate(payload)
//   }
// }

class TenantValidator extends BaseValidator {
  #companyNameSchema
  #addressSchema
  #cacNumberSchema
  #categorySchema
  #supportSchema
  #socialsSchema

  constructor () {
    super()

    this.#companyNameSchema = Joi.string()
      .label('Company name')
      .max(255)
      .messages({
        'string.max': '{#label} is too long',
        'any.required': '{#label} is required'
      })

    this.#addressSchema = Joi.object({
      address: Joi.string(),
      lga: Joi.string(),
      state: Joi.string()
    })

    this.#cacNumberSchema = Joi.string()
      .pattern(/^RC[\d]{3,8}$/)
      .invalid('RC0000', 'RC000')
      .messages({
        'any.invalid': 'Invalid CAC number',
        'string.pattern.base': 'CAC number must begin with "RC".',
        'any.required': 'CAC number is required'
      })

    this.#categorySchema = Joi.string()
      .valid(...companyCategory)
      .messages({
        'any.only': 'Not a valid category',
        'any.required': 'Company category is required'
      })

    this.#supportSchema = Joi.object({
      email: this._emailSchema.label('Support email address'),
      phone_number: this._phoneNumberSchema.label('Support phone number')
    })

    this.#socialsSchema = Joi.object({
      name: Joi.string()
        .valid(...socials)
        .required(),
      url: Joi.string().required(),
      active: Joi.boolean().default(false)
    })
  }

  validateSignUp = (dto) => {
    const schema = Joi.object({
      tenant: {
        company_name: this.#companyNameSchema.required(),
        category: this.#categorySchema.required()
      },
      user: {
        name: this._nameSchema.required(),
        email: this._emailSchema.label('User email address').required(),
        phone_number: this._phoneNumberSchema
          .label('User phone number')
          .required()
      }
    })

    const { value, error } = schema.validate(dto)
    if (error) this.formatErrorMessage(error)

    return { value, error }
  }

  validateUpdate = (dto) => {
    const schema = Joi.object({
      logo: Joi.string(),
      company_name: this.#companyNameSchema,
      location: this.#addressSchema.min(1),
      cac_number: this.#cacNumberSchema,
      category: this.#categorySchema,
      email: this._emailSchema,
      phone_number: this._phoneNumberSchema,
      website: Joi.string(),
      support: this.#supportSchema.min(1),
      social: this.#socialsSchema.min(1)
    })

    const { value, error } = schema.validate(dto)
    if (error) this.formatErrorMessage(error)

    return { value, error }
  }

  validateActivate = (dto) => {
    const schema = Joi.object({
      location: Joi.object({
        address: Joi.string().required(),
        lga: Joi.string().required(),
        state: Joi.string().required()
      }),
      cac_number: this.#cacNumberSchema.required(),
      support: this.#supportSchema.required()
    })

    const { value, error } = schema.validate(dto)
    if (error) this.formatErrorMessage(error)

    return { value, error }
  }

  validateDeactivate = (dto) => {
    const schema = Joi.object({
      password: Joi.string().label('Password').max(256).required()
    })

    const { value, error } = schema.validate(dto)
    if (error) this.formatErrorMessage(error)

    return { value, error }
  }
}

export default new TenantValidator()

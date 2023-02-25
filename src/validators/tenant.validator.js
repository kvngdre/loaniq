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
  #locationSchema
  #cacNumberSchema
  #categorySchema
  #supportSchema
  #socialsSchema

  constructor () {
    super()

    this.#companyNameSchema = Joi.string()
      .label('Company name')
      .min(2)
      .max(255)
      .messages({
        'string.min': '{#label} is not valid',
        'string.max': '{#label} is too long'
      })

    this.#locationSchema = Joi.object({
      address: Joi.string().invalid('').label('Address').messages({
        'any.invalid': '{#label} is required'
      }),
      lga: Joi.string().invalid('').label('LGA').messages({
        'any.invalid': '{#label} is required'
      }),
      state: Joi.string().invalid('').label('State').messages({
        'any.invalid': '{#label} is required'
      })
    }).min(1).label('Location')

    this.#cacNumberSchema = Joi.string()
      .label('CAC number')
      .pattern(/^RC[\d]{3,8}$/)
      .invalid('RC0000', 'RC000')
      .messages({
        'any.invalid': '{#label} is not valid',
        'string.pattern.base': '{#label} must begin with "RC"',
      })

    this.#categorySchema = Joi.string()
      .label('Category')
      .valid(...companyCategory)
      .messages({ 'any.only': 'Not a valid category' })

    this.#supportSchema = Joi.object({
      email: this._emailSchema.label('Support email'),
      phone_number: this._phoneNumberSchema.label('Support phone number')
    }).min(1)

    this.#socialsSchema = Joi.object({
      name: Joi.string().label('Social media name').valid(...socials),
      url: Joi.string().label('Social media url'),
      active: Joi.boolean().label('Active').default(false)
    }).min(1)
  }

  validateSignUp = (dto) => {
    const schema = Joi.object({
      tenant: {
        company_name: this.#companyNameSchema.required(),
        category: this.#categorySchema.required()
      },
      user: {
        name: this._nameSchema.required(),
        email: this._emailSchema.required(),
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
      location: this.#locationSchema,
      cac_number: this.#cacNumberSchema,
      category: this.#categorySchema,
      email: this._emailSchema,
      phone_number: this._phoneNumberSchema,
      website: Joi.string(),
      support: this.#supportSchema,
      social: this.#socialsSchema
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }

  validateActivate = (dto) => {
    const schema = Joi.object({
      location: this.#locationSchema.and('address', 'lga', 'state').required(),
      cac_number: this.#cacNumberSchema.required(),
      support: this.#supportSchema.and('email', 'phone_number').required()
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

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

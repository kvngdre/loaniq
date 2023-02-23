import DateTime from 'luxon'
import Joi from 'joi'
import objectId from 'joi-objectid'
Joi.objectId = objectId(Joi)

function isValidDOB (dob, helper) {
  const dobFormatted = DateTime.fromISO(new Date(dob).toISOString()).toFormat(
    'yyyy-MM-dd'
  )
  const minDob = DateTime.now().minus({ years: 18 }).toFormat('yyyy-MM-dd')

  if (dobFormatted > minDob) return helper.error('date.less')

  return dob
}

const nameSchema = Joi.object({
  first: Joi.string().label('First name').min(1).max(30).messages({
    'string.min': '{#label} is too short',
    'string.max': '{#label} is too long'
  }),
  last: Joi.string().label('Last name').min(3).max(30).messages({
    'string.min': '{#label} is too short',
    'string.max': '{#label} is too long'
  }),
  middle: Joi.string().label('Middle name').min(1).max(30).messages({
    'string.min': '{#label} is too short',
    'string.max': '{#label} is too long'
  })
})

const genderSchema = Joi.string().valid('Male', 'Female').messages({
  'any.only': 'Invalid gender',
  'any.required': 'Gender is required'
})

const birthDateSchema = Joi.date().label('Birth date').custom(isValidDOB).message({
  'date.less': 'Must be 18 years or older.',
  'any.required': 'Birth date is required'
})

const phoneSchema = Joi
  .string()
  .min(13)
  .max(14)
  .pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
  .messages({
    'string.min': 'Invalid phone number.',
    'string.max': 'Phone number is too long',
    'string.pattern.base':
            'Invalid phone number, please include international dialling code',
    'any.required': 'Phone number is required'
  })

const emailSchema = Joi.string().email().min(10).max(50).messages({
  'string.min': 'Invalid email address',
  'string.max': 'Invalid email address',
  'string.email': 'Please enter a valid email',
  'any.required': 'Email address is required'
})

const maritalStatusSchema = Joi
  .string()
  .valid('Single', 'Married', 'Divorced', 'Separated', 'Widow', 'Widower')
  .messages({
    'any.required': 'Marital status is required',
    'any.only': 'Invalid marital status'
  })

const ippisSchema = Joi
  .string()
  .pattern(/^([a-zA-Z]{2,5})?.[0-9]{3,8}$/)
  .uppercase()
  .messages({
    'string.pattern.base': 'Invalid IPPIS number',
    'any.required': 'Ippis number is required'
  })

const employerSchema = Joi.object({
  name: Joi.string().min(2).max(70).messages({
    'string.min': 'Employer name is not valid.',
    'string.max': 'Employer name is too long.',
    'any.required': 'Employer name is required'
  }),
  command: Joi.string().min(3).max(50).messages({
    'string.min': 'Command is not valid.',
    'string.max': 'Command is too long.',
    'any.required': 'Command is required'
  }),
  segment: Joi.objectId().messages({
    'any.required': 'Segment is required'
  }),
  location: Joi.object({
    address: Joi
      .string()
      .min(5)
      .max(100)
      .messages({
        'string.min': 'Address is too short.',
        'string.max': 'Address is too long.',
        'any.required': 'Employer address is required'
      })
      .required(),
    state: Joi.string().messages({
      'any.required': 'Employer state is required'
    }),
    lga: Joi.string().messages({
      'any.required': 'Employer L.G.A is required'
    })
  }),
  hireDate: Joi
    .date()
    .min(
      Joi.ref('...birthDate', {
        adjust: (value) => {
          value.setFullYear(value.getFullYear() + 18)
          return value
        }
      })
    )
    .message({
      'date.min': 'Hire date is not valid',
      'any.required': 'Hire date is required'
    })
})

const bvnSchema = Joi
  .string()
  .pattern(/^22[0-9]{9}$/)
  .message({
    'string.pattern.base': 'Invalid BVN',
    'any.required': 'BVN is required'
  })

const idTypeSchema = Joi
  .string()
  .valid(
    'Voters card',
    'International passport',
    'Staff ID card',
    'National ID card',
    "Driver's license"
  )
  .messages({
    'any.only': 'ID type is not valid',
    'any.required': 'ID type is required'
  })
const idNoSchema = Joi
  .string()
  .pattern(/^([a-zA-Z]{2,7})?.[0-9]{3,11}$/)
  .messages({
    'string.pattern.base': 'Invalid ID number',
    'any.required': 'ID card number is required'
  })

const nokSchema = Joi.object({
  fullName: Joi.string().min(10).max(70).messages({
    'string.min': 'Next of kin name is too short.',
    'string.max': 'Next of kin name is too long',
    'any.required': 'Full name of next of kin is required'
  }),
  location: Joi.object({
    address: Joi
      .string()
      .min(9)
      .max(100)
      .messages({
        'string.min': 'Next of kin address is too short',
        'string.max': 'Next of kin address is too long',
        'any.required': 'Next of kin address is required'
      })
      .required(),
    state: Joi.string().messages({
      'any.required': 'Next of kin state is required'
    }),
    lga: Joi.string().messages({
      'any.required': 'Next of kin L.G.A is required'
    })
  }),
  phone: Joi
    .string()
    .pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
    .message({
      'string.pattern.base':
                'Invalid next of kin phone number, please include international dialling code',
      'any.required': 'Next of kin phone number is required'
    }),
  relationship: Joi.string().messages({
    'any.required': 'Relationship to next of kin is required'
  })
})

const accountNameSchema = Joi.string().min(8).max(100).messages({
  'string.min': 'Account name is not valid',
  'string.max': 'Account name is too long',
  'any.required': 'Account name is required'
})
const accountNoSchema = Joi
  .string()
  .pattern(/^[0-9]{10}$/)
  .messages({
    'string.pattern.base': 'Invalid account number.',
    'any.required': 'Account number is required'
  })
const bankSchema = Joi.object({
  name: Joi.string().messages({
    'any.required': 'Bank name is required'
  }),
  code: Joi.string().messages({
    'any.required': 'Bank code is required'
  })
})

const netPaySchema = Joi.number().min(0).precision(2).messages({
  'any.required': 'Net pay is required',
  'number.min': 'Net pay cannot be less than zero'
})

const validators = {
  validateCreateCustomer: function (user, customer) {
    const schema = Joi.alternatives().try(
      Joi.objectId().required(),
      Joi.object({
        lender: Joi.objectId().default(user.lender),
        name: Joi.object({
          first: Joi.string().label('First name').min(1).max(30).messages({
            'string.min': '{#label} is too short',
            'string.max': '{#label} is too long'
          }).required(),
          last: Joi.string().label('Last name').min(3).max(30).messages({
            'string.min': '{#label} is too short',
            'string.max': '{#label} is too long'
          }).required(),
          middle: Joi.string().label('Middle name').min(1).max(30).messages({
            'string.min': '{#label} is too short',
            'string.max': '{#label} is too long'
          })
        }),
        gender: genderSchema.required(),
        birthDate: birthDateSchema.required(),
        residentialAddress: Joi.object({
          address: Joi.string().min(9).max(70).required().messages({
            'string.min': 'Address is too short.',
            'string.max': 'Address is too long.'
          }),
          state: Joi.string().required().messages({
            'any.required': 'Employer state is required'
          }),
          stateCode: Joi.string().length(2).required().messages({
            'any.required': 'State code is required'
          }),
          lga: Joi.string().required().messages({
            'any.required': 'L.G.A is required'
          }),
          geo: Joi.string().required().messages({
            'any.required': 'Geo-political zone is required'
          })
        }),
        phone: phoneSchema.required(),
        email: emailSchema.required(),
        maritalStatus: maritalStatusSchema.required(),
        bvn: bvnSchema.required(),
        ippis: ippisSchema.required(),
        idType: idTypeSchema.required(),
        idNo: idNoSchema.required(),
        employer: Joi.object({
          name: Joi.string().min(2).max(70).required().messages({
            'string.min': 'Employer name is not valid.',
            'string.max': 'Employer name is too long.',
            'any.required': 'Employer name is required'
          }),
          command: Joi.string().min(3).max(50).messages({
            'string.min': 'Command is not valid.',
            'string.max': 'Command is too long.',
            'any.required': 'Command is required'
          }),
          segment: Joi.string().required().messages({
            'any.required': 'Segment is required'
          }),
          location: Joi.object({
            address: Joi
              .string()
              .min(5)
              .max(100)
              .required()
              .messages({
                'string.min': 'Address is too short.',
                'string.max': 'Address is too long.',
                'any.required': 'Employer address is required'
              }),
            state: Joi.string().required().messages({
              'any.required': 'Employer state is required'
            }),
            lga: Joi.string().required().messages({
              'any.required': 'Employer L.G.A is required'
            })
          }),
          hireDate: Joi
            .date()
            .min(
              Joi.ref('...birthDate', {
                adjust: (value) => {
                  try {
                    value.setFullYear(value.getFullYear() + 18)
                    return value
                  } catch (err) {
                    return '1900-01-01'
                  }
                }
              })
            )
            .required()
            .messages({
              'date.min': 'Hire date is not valid',
              'any.required': 'Hire date is required'
            })
        }),
        nok: Joi.object({
          fullName: Joi.string().min(10).max(70).required().messages({
            'string.min': 'Next of kin name is too short.',
            'string.max': 'Next of kin name is too long.',
            'any.required': 'Full name of next of kin is required'
          }),
          location: Joi.object({
            address: Joi
              .string()
              .min(9)
              .max(100)
              .required()
              .messages({
                'string.min':
                                    'Next of kin address is too short.',
                'string.max':
                                    'Next of kin address is too long.',
                'any.required':
                                    'Next of kin address is required'
              }),
            state: Joi.string().required().messages({
              'any.required': 'Next of kin state is required'
            }),
            lga: Joi.string().required().messages({
              'any.required': 'Next of kin L.G.A is required'
            })
          }),
          phone: Joi
            .string()
            .pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
            .required()
            .messages({
              'string.pattern.base':
                                'Invalid next of kin phone number, please include international dialling code',
              'any.required':
                                'Next of kin phone number is required'
            }),
          relationship: Joi.string().required().messages({
            'any.required':
                            'Relationship to next of kin is required'
          })
        }),
        accountName: accountNameSchema.required(),
        accountNo: accountNoSchema.required(),
        bank: Joi.object({
          name: Joi.string().required().messages({
            'any.required': 'Bank name is required'
          }),
          code: Joi.string().required().messages({
            'any.required': 'Bank code is required'
          })
        }),
        netPay: netPaySchema.required()
      })
    )

    return schema.validate(customer, { abortEarly: false })
  },

  validateUpdateCustomer: function (customer) {
    const schema = Joi
      .object({
        name: nameSchema,
        gender: genderSchema,
        birthDate: birthDateSchema,
        residentialAddress: Joi.object({
          address: Joi.string().min(9).max(70).messages({
            'string.min': 'Address is too short.',
            'string.max': 'Address is too long.'
          }),
          state: Joi.string(),
          stateCode: Joi.string().length(2),
          lga: Joi.string(),
          geo: Joi.string()
        }),
        phone: phoneSchema,
        email: emailSchema,
        maritalStatus: maritalStatusSchema,
        bvn: bvnSchema,
        ippis: ippisSchema,
        idType: idTypeSchema,
        idNo: idNoSchema,
        employer: employerSchema,
        nok: nokSchema,
        accountName: accountNameSchema,
        accountNo: accountNoSchema,
        bank: bankSchema
      })
      .min(1)
      .messages({ 'object.min': 'No changes detected' })

    return schema.validate(customer)
  }
}

export default validators

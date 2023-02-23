import Joi from 'joi'

const codeSchema = Joi.string()
  .pattern(/^[a-zA-z]{2}$/)
  .messages({
    'string.pattern.base': 'Invalid state code',
    'any.required': 'State code is required'
  })

const nameSchema = Joi.string().max(255).messages({
  'string.max': 'State name is too long',
  'any.required': 'State name is required'
})

const lgasSchema = Joi.array().items(Joi.string()).messages({
  'array.min': 'LGAs cannot be empty',
  'any.required': 'LGA is required'
})

const geoSchema = Joi.string().valid(
  'North Central',
  'North East',
  'North West',
  'South East',
  'South South',
  'South West'
).messages({
  'any.only': 'Invalid geo political zone',
  'any.required': 'Geo political zone is required'
})
const validators = {
  create: function (state) {
    const schema = Joi.object({
      code: codeSchema.required(),
      name: nameSchema.required(),
      lgas: lgasSchema.required(),
      geo: geoSchema.required()
    })
    return schema.validate(state)
  },

  update (state) {
    const schema = Joi.object({
      code: codeSchema,
      name: nameSchema,
      lgas: lgasSchema,
      geo: geoSchema
    })
    return schema.validate(state)
  }
}

export default validators

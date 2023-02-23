import Joi from 'joi'

const bankNameSchema = Joi.string().label('Name').min(8).max(20).messages({
  'string.min': '{#label} too short.',
  'string.max': '{#label} too long.'
})

const bankCodeSchema = Joi.string()
  .min(3)
  .max(6)
  .pattern(/^[0-9]{3,6}$/)
  .messages({
    'string.min': 'Invalid {#label}',
    'string.max': 'Invalid {#label}',
    'string.pattern.base': 'Invalid {#label}'
  })

const validators = {
  validateCreation: function (bank) {
    const schema = Joi.object({
      name: bankNameSchema.required(),
      code: bankCodeSchema.required()
    })

    return schema.validate(bank)
  },

  validateUpdate: function (bank) {
    const schema = Joi.object({
      name: bankNameSchema,
      code: bankCodeSchema
    }).min(1)

    return schema.validate(bank)
  }
}

export default validators

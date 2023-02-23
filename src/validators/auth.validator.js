import Joi from 'joi'

const emailSchema = Joi.string().email().min(10).max(50).messages({
  'string.min': 'Invalid email address',
  'string.max': 'Invalid email address',
  'string.email': 'Please enter a valid email address'
})

const validators = {
  validateLogin: function (lender) {
    const schema = Joi.object({
      email: emailSchema.required(),
      password: Joi.string().max(40).required()
    })
    return schema.validate(lender)
  }
}

export default validators

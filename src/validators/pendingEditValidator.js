import { roles } from '../utils/constants'
import Joi from 'joi'
import objectId from 'joi-objectid'
Joi.objectId = objectId(Joi)

const validators = {
  create: function(obj) {
    const schema = Joi.object({
      docId: Joi.objectId().required().messages({
        'any.required': 'Document Id is required'
      }),
      type: Joi.string().valid('Customer', 'Loan').required().messages({
        'any.required': 'Document type is required'
      }),
      alteration: Joi.object().required().messages({
        'any.required': 'Alteration is required'
      })
    })

    return schema.validate(obj)
  },

  update: function(user, payload) {
    if ([roles.credit, roles.operations].includes(user.role)) {
      const schema = Joi.object({
        alteration: Joi.object()
          .min(1)
          .when('status', {
            is: Joi.exist(),
            then: Joi.forbidden(),
            otherwise: Joi.optional()
          })
          .messages({
            'object.min': 'Alteration cannot be empty.'
          }),

        status: Joi.string()
          .valid('Approved', 'Pending', 'Denied')
          .messages({
            'any.only': 'Not a valid status'
          }),

        remark: Joi.string()
          .when('status', {
            is: ['Denied', 'Approved'],
            then: Joi.required(),
            otherwise: Joi.optional()
          })
          .min(10)
          .max(255)
          .messages({
            'string.min': 'Remark is too short.',
            'string.max': 'Remark is too long.'
          })
      })
      return schema.validate(payload)
    }
    const schema = Joi.object({
      alteration: Joi.object().min(1).messages({
        'object.min': 'Alteration cannot be empty.'
      })
    })
    return schema.validate(payload)
  }
}

export default validators

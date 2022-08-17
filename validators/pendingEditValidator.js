const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validators = {
    create: function(obj) {
        const schema = Joi.object({
            documentId: Joi.objectId().required(),
            type: Joi.string()
                     .valid('customer', 'loan')
                     .required(),
            alteration: Joi.object().required()
        });

        return schema.validate(obj);
    },

    edit: function(obj) {
        const schema = Joi.object({
            status: Joi.string()
                       .valid('approved', 'denied')
                       .required(),

            reason: Joi.string().when('status', {
                is: 'denied',
                then: Joi.required(),
                otherwise: Joi.forbidden()
            })
        });

        return schema.validate(obj);
    }
}

module.exports = validators;
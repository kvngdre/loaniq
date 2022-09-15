const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validators = {
    create: function(obj) {
        const schema = Joi.object({
            docId: Joi.objectId().required(),
            type: Joi.string()
                     .valid('Customer', 'Loan')
                     .required(),
            alteration: Joi.object().required()
        });

        return schema.validate(obj);
    },

    edit: function(obj) {
        const schema = Joi.object({
            status: Joi.string()
                       .valid('Approved', 'Denied')
                       .required(),

            remark: Joi.string().when('status', {
                is: ['Denied', 'Approved'],
                then: Joi.required(),
                otherwise: Joi.optional()
            })
        });

        return schema.validate(obj);
    }
}

module.exports = validators;
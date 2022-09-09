const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validators = {
    validateCreation: function (transaction) {
        const schema = Joi.object({
            lenderId: Joi.objectId().required(),
            status: Joi.string().required(),
            provider: Joi.string().required(),
            reference: Joi.string().required(),
            category: Joi.string()
                     .valid('Debit', 'Credit')
                     .required(),
            description: Joi.string(),
            channel: Joi.string(),
            cardType: Joi.string(),
            bankName: Joi.string(),
            amount: Joi.number()
                       .min(0)
                       .required(),
            fees: Joi.number()
                     .min(0),
            balance: Joi.number(),
            paidAt: Joi.date()
        })

        return schema.validate(transaction);
    },

    validateEdit: function(data) {
        const schema = Joi.object({
            id: Joi.alternatives(Joi.string, Joi.number()),
            status: Joi.string()
        })
    },

    validateFilters: function (filters) {
        const schema = Joi.object({
            type: Joi.string().valid('Credit', 'Debit'),
            date: Joi.object({
                start: Joi.date().iso(),
                end: Joi.date().iso(),
            }),
        });

        return schema.validate(filters);
    },
};

module.exports = validators;

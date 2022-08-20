const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validators = {
    validateCreation: function (transaction) {
        const schema = Joi.object({
            lender: Joi.objectId,

            userId: Joi.objectId,

            type: Joi.string()
                .valid('Debit', 'Credit')
                .required()
                .messages({
                    'any.only': `Element at index ${'{#label}'.replace(
                        'type',
                        ''
                    )} is not valid.`,
                }),

            description: Joi.string(),

            amount: Joi.number().positive().required(),

            balance: Joi.number().required(),
        });

        return schema.validate(transaction);
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

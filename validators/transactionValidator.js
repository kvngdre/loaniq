const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validators = {
    create: function (transaction) {
        const schema = Joi.object({
            lender: Joi.objectId().required(),
            id: Joi.string(),
            status: Joi.string()
                .required()
                .valid('Abandoned', 'Failed', 'Pending', 'Successful'),
            gateway: Joi.string(),
            reference: Joi.string().required(),
            category: Joi.string().valid('Debit', 'Credit').required(),
            desc: Joi.string(),
            channel: Joi.string().required(),
            bank: Joi.string(),
            cardType: Joi.string(),
            amount: Joi.number().min(0).required(),
            fees: Joi.number().min(0),
            balance: Joi.number(),
            paidAt: Joi.date().required(),
        });

        return schema.validate(transaction);
    },

    update: function (data) {
        const schema = Joi.object({
            lender: Joi.objectId(),
            status: Joi.string().valid(
                'Abandoned',
                'Failed',
                'Pending',
                'Successful'
            ),
            gateway: Joi.string(),
            reference: Joi.string(),
            category: Joi.string().valid('Debit', 'Credit'),
            desc: Joi.string(),
            channel: Joi.string(),
            bank: Joi.string(),
            cardType: Joi.string(),
            amount: Joi.number().min(0),
            fees: Joi.number().min(0),
            balance: Joi.number(),
            paidAt: Joi.date(),
        });
        return schema.validate(data);
    },
};

module.exports = validators;

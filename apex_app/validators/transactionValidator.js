const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);


const validators = {
    validateCreation: function(transaction) {
        const schema = Joi.object({
            lender: Joi.objectId,

            userId: Joi.objectId,

            type: Joi.string()
                     .valid(['debit', 'credit'])
                     .required()
                     .messages({
                        "any.only": `Element at index ${"{#label}".replace('type', '')} is not valid.`
                     }),

            description: Joi.string(),

            amount: Joi.number()
                       .positive()
                       .required(),

            balance: Joi.number()
                        .required(),

        });

        return schema.validate(transaction);
    }
}

module.exports = validators;
const Joi = require('@hapi/joi');
const config = require('config');
Joi.objectId = require('joi-objectid')(Joi);


const validators = {
    validateCreation : function(loan) {
        const schema = Joi.object({
            ippis: Joi.string(),

            netPay: Joi.number()
                       .required(),

            amount: Joi.number()
                       .min(config.get("minLoanAmount")),

            amountInWords: Joi.string(),
            
            tenor: Joi.number()
                      .min(config.get("minTenor")),

            agent: Joi.objectId()
                      .required()
        });
    return schema.validate(loan);
    }
};

module.exports = validators;
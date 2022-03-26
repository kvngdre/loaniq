const Joi = require('@hapi/joi');
const config = require('config');
Joi.objectId = require('joi-objectid')(Joi);


const validators = {
    validateCreation: {
        loanRequest: function(loan) {
            const schema = Joi.object({
                ippis: Joi.string(),
    
                customer: Joi.objectId(),
    
                netPay: Joi.number()
                           .required(),
    
                amount: Joi.number()
                           .min(config.get('minLoanAmount'))
                           .max(config.get('maxLoanAmount')),
    
                amountInWords: Joi.string(),
    
                tenor: Joi.number()
                          .min(config.get('minTenor'))
                          .max(config.get('maxTenor')),
    
                loanType: Joi.string(),
    
                loanAgent: Joi.objectId()
            });
    
        return schema.validate(loan);
        
        },

        loan: function(loan) {
            const schema = Joi.object({
                ippis: Joi.string()
                          .required(),
    
                customer: Joi.objectId()
                             .required(),
    
                netPay: Joi.number()
                           .required(),
    
                amount: Joi.number()
                           .min(config.get('minLoanAmount'))
                           .max(config.get('maxLoanAmount'))
                           .required(),
    
                amountInWords: Joi.string()
                                  .required(),
    
                tenor: Joi.number()
                          .min(config.get('minTenor'))
                          .max(config.get('maxTenor'))
                          .required(),
    
                loanType: Joi.string()
                             .required(),
    
                loanAgent: Joi.objectId()
                              .required()
            });
    
        return schema.validate(loan);
        
        }
    },


};

module.exports = validators;
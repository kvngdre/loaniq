const Joi = require('@hapi/joi');
const config = require('config');
Joi.objectId = require('joi-objectid')(Joi);


const validators = {
    validateCreation: {
        loanRequest: function(loan) {
            const schema = Joi.object({     
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

                customer: Joi.objectId(),

                loanAgent: Joi.objectId(),
            });
    
        return schema.validate(loan);
        
        },

        loan: function(loan) {
            const schema = Joi.object({
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
                             .required()
            });
    
        return schema.validate(loan);
        
        }
    },

    validateEdit: function(loan) {
        const schema = Joi.object({
            netPay: Joi.number(),
                    //    .min(config.get('minNetPay')),

            amount: Joi.number()
                       .min(config.get('minLoanAmount'))
                       .max(config.get('maxLoanAmount')),

            amountInWords: Joi.string(),

            tenor: Joi.number()
                      .min(config.get('minTenor'))
                      .max(config.get('maxTenor')),

            loanType: Joi.string(),

            recommendedAmount: Joi.number(),

            recommendedTenor: Joi.number(),

            status: Joi.string(),

            customer: Joi.objectId(),
            
            loanAgent: Joi.objectId(),

            interestRate: Joi.number(),

            upfrontFeePercentage: Joi.number(),

            fee: Joi.number(),
        });

        return schema.validate(loan);
    },

};

module.exports = validators;
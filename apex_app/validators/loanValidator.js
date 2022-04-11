const Joi = require('@hapi/joi');
const config = require('config');
Joi.objectId = require('joi-objectid')(Joi);
const LoanConfig = require('../models/lenderConfigModel');


const netPaySchema = Joi.number()
                        .min(config.get('loanMetrics.minNetPay'))
                        .required();

const amountSchema = Joi.number()
                        .min(config.get('loanMetrics.minLoanAmount'))
                        .max(config.get('loanMetrics.maxLoanAmount'));

const tenorSchema = Joi.number()
                       .min(config.get('loanMetrics.minTenor'))
                       .max(config.get('loanMetrics.maxTenor'));

const validators = {
    validateCreation: {
        loanRequest: function(loan) {
            const schema = Joi.object({     
                netPay: netPaySchema,
    
                amount: amountSchema,
    
                amountInWords: Joi.string(),
    
                tenor: tenorSchema,
    
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

                netPay: netPaySchema,
    
                amount: amountSchema,
    
                amountInWords: Joi.string()
                                  .required(),
    
                tenor: tenorSchema,
    
                loanType: Joi.string()
                             .required()
            });
    
        return schema.validate(loan);
        
        }
    },

    validateEdit: function(loan) {
        const schema = Joi.object({
            netPay: Joi.number()
                       .min(config.get('loanMetrics.minNetPay')),

            amount: Joi.number()
                       .min(config.get('loanMetrics.minLoanAmount')),

            amountInWords: Joi.string(),

            tenor: tenorSchema,

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
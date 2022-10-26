const { roles } = require('../utils/constants');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

class LoanValidator {
    #minNetPay;
    #minLoanAmount;
    #maxLoanAmount;
    #minTenor;
    #maxTenor;
    #interestRate;
    #upfrontFeePercent;
    #transferFee;
    #maxDti;
    #netPaySchema;
    #amountSchema;
    #tenorSchema;
    constructor(minNetPay, minLoanAmount, maxLoanAmount, minTenor, maxTenor, interestRate, upfrontFeePercent, transferFee, maxDti) {
        this.#minNetPay = minNetPay;
        this.#minLoanAmount = minLoanAmount;
        this.#maxLoanAmount = maxLoanAmount;
        this.#minTenor = minTenor;
        this.#maxTenor = maxTenor;
        this.#interestRate = interestRate;
        this.#upfrontFeePercent = upfrontFeePercent;
        this.#transferFee = transferFee;
        this.#maxDti = maxDti;
        this.#netPaySchema = Joi.number().min(this.#minNetPay).messages({
            'number.min': `Net pay must be greater than or equal to ${this.#minNetPay}.`
        });
        this.#amountSchema = Joi.number()
            .min(this.#minLoanAmount)
            .max(this.#maxLoanAmount)
            .messages({
                'number.min': `Loan amount cannot be less than ${this.#minLoanAmount.toLocaleString()}.`,
                'number.max': `Loan amount cannot be greater than ${this.#maxLoanAmount.toLocaleString()}.`,
                'any.required': 'Loan amount is required',
            });
        this.#tenorSchema = Joi.number()
            .min(this.#minTenor)
            .max(this.#maxTenor)
            .messages({
                'number.min': `Loan tenor cannot be less than ${this.#minTenor.toLocaleString()} months.`,
                'number.max': `Loan tenor cannot be greater than ${this.#maxTenor.toLocaleString()} months.`,
                'any.required': 'Loan tenor is required',
            });
    }

    create(loan) {
        const schema = Joi.object({
            amount: this.#amountSchema.required(),
            amountInWords: Joi.string().min(18).max(50).required().messages({
                'string.min': 'Loan amount in words is too short',
                'string.max': 'Loan amount in words is too long',
                'any.required': 'Amount in words is required',
            }),
            tenor: this.#tenorSchema.required(),
            loanType: Joi.string().valid('New', 'Top Up').messages({
                'any.only': 'Invalid loan type',
            }).default('New'),
            creditUser: Joi.objectId(),
            agent: Joi.objectId(),
            params: Joi.object({
                interestRate: Joi.number(),
                upfrontFeePercent: Joi.number(),
                transferFee: Joi.number(),
                maxDti: Joi.number(),
                minNetPay: Joi.number(),
                netPay: this.#netPaySchema
            }).default({
                interestRate: this.#interestRate,
                upfrontFeePercent: this.#upfrontFeePercent,
                transferFee: this.#transferFee,
                maxDti: this.#maxDti,
                minNetPay: this.#minNetPay,
            })
        });
        return schema.validate(loan);
    }

    update(loan) {
        if(user.role === roles.credit) {
            const schema = Joi.object({
                amount: this.#amountSchema,
                amountInWords: Joi.string()
                    .when('amount', {
                        is: Joi.exist(),
                        then: Joi.required(),
                        otherwise: Joi.optional(),
                    })
                    .min(18)
                    .max(50)
                    .messages({
                        'string.min': 'Loan amount in words is too short',
                        'string.max': 'Loan amount in words is too long',
                        'any.required': 'Amount in words is required',
                    }),
                tenor: this.#tenorSchema,
                loanType: Joi.string().valid('New', 'Top Up').messages({
                    'any.only': 'Invalid loan type',
                }),
                status: Joi.string().valid(
                    'Discontinued',
                    'Liquidated',
                    'Approved',
                    'On Hold',
                    'Pending',
                    'Denied'
                ),
                remark: Joi.string()
                    .when('status', {
                        is: Joi.exist(),
                        then: Joi.when('status', {
                            is: ['Pending'],
                            then: Joi.optional(),
                            otherwise: Joi.required(),
                        }),
                    })
                    .invalid('', ' ')
                    .valid(
                        'Duplicate request',
                        'Ok for disbursement',
                        'Net pay below threshold',
                        'Inconsistent net pay',
                        'High exposure',
                        'Confirm recommended loan amount',
                        'Confirm recommended tenor',
                        'Confirm BVN',
                        'Confirm account number',
                        'Confirm BVN and account number',
                        'Bad loan with other institution',
                        'Age above threshold',
                        'Length of service above threshold',
                        'Negative net pay',
                        'Department not eligible',
                        'Name mismatch',
                        'Not eligible for top up',
                        'Net pay not available',
                        'Incorrect IPPIS number',
                        'Client rejected offer',
                        'Failed to provide valid documentation'
                    )
                    .messages({
                        'any.required': 'Remark is required',
                    }),
                recommendedAmount: Joi.number()
                    .min(this.#minLoanAmount)
                    .max(this.#maxLoanAmount)
                    .when('status', {
                        is: ['Approved', 'Denied', 'On Hold'],
                        then: Joi.optional(),
                    })
                    .messages({
                        'number.min': `"Recommended amount" must be greater than or equal to ${this.#minLoanAmount.toLocaleString()}.`,
                        'number.max': `"Recommended amount" must be less than or equal to ${this.#maxLoanAmount.toLocaleString()}.`,
                    }),
                recommendedTenor: Joi.number()
                    .min(this.#minTenor)
                    .max(this.#maxTenor)
                    .when('status', {
                        is: ['Approved', 'Denied', 'On Hold'],
                        then: Joi.optional(),
                    })
                    .messages({
                        'number.min': `"Recommended tenor" must be greater than or equal to ${this.#minTenor.toLocaleString()} months.`,
                        'number.max': `"Recommended tenor" must be less than or equal to ${this.#maxTenor.toLocaleString()} months.`,
                    }),
                });

                return schema.validate(loan);
            
        }
        const schema = Joi.object({
            amount: this.#amountSchema,
            amountInWords: Joi.string()
                .when('amount', {
                    is: Joi.exist(),
                    then: Joi.required(),
                    otherwise: Joi.optional(),
                })
                .min(18)
                .max(50)
                .messages({
                    'string.min': 'Loan amount in words is too short',
                    'string.max': 'Loan amount in words is too long',
                    'any.required': 'Amount in words is required',
                }),
            tenor: this.#tenorSchema,
            loanType: Joi.string().valid('New', 'Top Up').messages({
                'any.only': 'Invalid loan type',
            }),
            customer: Joi.objectId(),
            agent: Joi.objectId(),
            creditUser: Joi.objectId(),
            params: {
                // interestRate: Joi.number(),
                // upfrontFeePercent: Joi.number(),
                // transferFee: Joi.number(),
                netPay: this.#netPaySchema,
            }
        }).min(1);

        return schema.validate(loan);
    }
}


module.exports = LoanValidator;


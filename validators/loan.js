const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

class LoanRequestValidators {
    #minNetPay;
    #minLoanAmount;
    #maxLoanAmount;
    #minTenor;
    #maxTenor;
    #netPaySchema;
    #amountSchema;
    #tenorSchema;
    constructor(minNetPay, minLoanAmount, maxLoanAmount, minTenor, maxTenor) {
        this.#minNetPay = minNetPay;
        this.#minLoanAmount = minLoanAmount;
        this.#maxLoanAmount = maxLoanAmount;
        this.#minTenor = minTenor;
        this.#maxTenor = maxTenor;
        this.#netPaySchema = Joi.number().min(this.#minNetPay);
        this.#amountSchema = Joi.number()
            .min(this.#minLoanAmount)
            .max(this.#maxLoanAmount)
            .messages({
                'number.min': `"Loan amount" must be greater than or equal to ${this.#minLoanAmount.toLocaleString()}.`,
                'number.max': `"Loan amount" must be less than or equal to ${this.#maxLoanAmount.toLocaleString()}.`,
            });
        this.#tenorSchema = Joi.number()
            .min(this.#minTenor)
            .max(this.#maxTenor)
            .messages({
                'number.min': `"Loan tenor" must be greater than or equal to ${this.#minTenor.toLocaleString()} months.`,
                'number.max': `"Loan tenor" must be less than or equal to ${this.#maxTenor.toLocaleString()} months.`,
            });
    }

    create(loan) {
        const schema = Joi.object({
            amount: this.#amountSchema.required(),
            amountInWords: Joi.string().min(18).max(50).required(),
            tenor: this.#tenorSchema.required(),
            loanAgent: Joi.objectId(),
            creditOfficer: Joi.objectId(),
        });
        return schema.validate(loan);
    }

    validateEdit(loan) {
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
                    'any.required': 'Amount in words is required.',
                }),
            tenor: this.#tenorSchema,
            loanType: Joi.string().valid('New', 'Top Up').messages({
                'any.only': 'Invalid loan type.'
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
                    'Client discontinued',
                    'Failed to provide valid documentation'
                )
                .messages({
                    'any.required': 'Remark is required.',
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
            // customer: Joi.objectId(),
            loanAgent: Joi.objectId(),
            creditOfficer: Joi.objectId(),

            // interestRate: Joi.number(),
            // upfrontFeePercent: Joi.number(),
            // transferFee: Joi.number(),
            // netPay: this.#netPaySchema,
        });

        return schema.validate(loan);
    }
}

const loanValidators = {
    validateDisbursement: function (dateTimeObj) {
        // TODO: finish disbursement
        const schema = Joi.object({
            start: Joi.string().required(),
            end: Joi.date(),
            disbursed: Joi.boolean(),
        });

        return schema.validate(dateTimeObj);
    },
};

module.exports = {
    LoanRequestValidators,
    loanValidators,
};

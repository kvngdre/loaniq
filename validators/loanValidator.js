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
            .max(this.#maxLoanAmount);
        this.#tenorSchema = Joi.number()
            .min(this.#minTenor)
            .max(this.#maxTenor);
    }

    loanRequestCreation(loanRequest) {
        const schema = Joi.object({
            amount: this.#amountSchema.required(),
            amountInWords: Joi.string().required(),
            tenor: this.#tenorSchema.required(),
            loanType: Joi.string(),
        });
        return schema.validate(loanRequest);
    }

    loanCreation(newLoan) {
        const schema = Joi.object({
            customer: Joi.objectId().required(),
            amount: this.#amountSchema.required(),
            amountInWords: Joi.string().required(),
            tenor: this.#tenorSchema.required(),
            loanType: Joi.string(),
        });
        return schema.validate(newLoan);
    }

    validateEdit(loan) {
        const schema = Joi.object({
            amount: this.#amountSchema,
            amountInWords: Joi.string(),
            tenor: this.#tenorSchema,
            loanType: Joi.string(),
            status: Joi.string().valid(
                'Discontinued',
                'Liquidated',
                'Completed',
                'Approved',
                'On Hold',
                'Pending',
                'Denied'
            ),
            comment: Joi.string()
                .when('status', {
                    is: Joi.exist(),
                    then: Joi.when('status', {
                        is: ['Approved', 'Pending'],
                        then: Joi.optional(),
                        otherwise: Joi.required(),
                    }),
                })
                .invalid('', ' ')
                .min(4),
            recommendedAmount: Joi.number()
                .min(this.#minLoanAmount)
                .max(this.#maxLoanAmount)
                .when('status', {
                    is: ['Approved', 'Denied', 'On Hold'],
                    then: Joi.required(),
                }),
            recommendedTenor: Joi.number()
                .min(this.#minTenor)
                .max(this.#maxTenor)
                .when('status', {
                    is: ['Approved', 'Denied', 'On Hold'],
                    then: Joi.required(),
                }),
            customer: Joi.objectId(),
            loanAgent: Joi.objectId(),

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

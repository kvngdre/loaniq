const Joi = require('joi');
const { ref } = require('joi');
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
    constructor(minNetPay, minLoanAmount, maxLoanAmount, minTenor, maxTenor ) {
        this.#minNetPay = minNetPay;
        this.#minLoanAmount = minLoanAmount;
        this.#maxLoanAmount = maxLoanAmount;
        this.#minTenor = minTenor;
        this.#maxTenor = maxTenor;
        this.#netPaySchema = Joi.number().min(this.#minNetPay);
        this.#amountSchema = Joi.number().min(this.#minLoanAmount).max(this.#maxLoanAmount);
        this.#tenorSchema = Joi.number().min(this.#minTenor).max(this.#maxTenor);
    }

    loanRequestCreation(loanRequest) {
        const schema = Joi.object({  
            slug: Joi.string(),
            
            netPay: this.#netPaySchema.required(),

            amount: this.#amountSchema.required(),

            amountInWords: Joi.string(),

            tenor: this.#tenorSchema,

            loanType: Joi.string(),

            customer: Joi.objectId(),

            loanAgent: Joi.objectId(),
        });
        return schema.validate(loanRequest);
    };

    loanCreation(newLoan) {
        const schema = Joi.object({
            customer: Joi.objectId().required(),

            netPay: this.#netPaySchema,

            amount: this.#amountSchema,

            amountInWords: Joi.string().required(),

            tenor: this.#tenorSchema,

            loanType: Joi.string()
        });
        return schema.validate(newLoan);
    };

    validateEdit(loan) {
        const schema = Joi.object({
            netPay: this.#netPaySchema,

            amount: this.#amountSchema,

            amountInWords: Joi.string(),

            tenor: this.#tenorSchema,

            loanType: Joi.string(),

            recommendedAmount: Joi.number(),

            recommendedTenor: Joi.number(),

            status: Joi.string(),

            customer: Joi.objectId(),
            
            loanAgent: Joi.objectId(),

            interestRate: Joi.number(),

            upfrontFeePercentage: Joi.number(),

            fee: Joi.number()
        });
        return schema.validate(loan);
    }

};

const loanValidators ={
    validateDateTimeObj: function (dateTimeObj) {
        // TODO: finish disbursement
        const schema = Joi.object({
            fromDate: Joi.string()
        });

        return schema.validate(dateTimeObj);
    }
}
module.exports = {
    LoanRequestValidators,
    loanValidators
};
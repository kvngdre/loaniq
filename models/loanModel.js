const mongoose = require('mongoose');
const {
    calcDti,
    calcNetValue,
    calcRepayment,
    calcTotalRepayment,
    calcUpfrontFee,
} = require('../utils/LoanParams');
const { loanStatus, loanRemarks } = require('../utils/constants');
const logger = require('../utils/logger')('loanModel.js');
const ServerError = require('../errors/serverError');

const schemaOptions = { timestamps: true, versionKey: false };

const loanSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true,
        },

        recommendedAmount: {
            type: Number,
            default: (self = this) => self.amount,
        },

        amountInWords: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },

        tenor: {
            type: Number,
            required: true,
        },

        recommendedTenor: {
            type: Number,
            default: (self = this) => self.tenor,
        },

        loanType: {
            type: String,
            enum: ['New', 'Top Up'],
            default: 'New',
        },

        status: {
            type: String,
            enum: Object.values(loanStatus),
            default: loanStatus.pend,
        },

        remark: {
            type: String,
            enum: loanRemarks,
        },

        upfrontFee: {
            type: Number,
        },

        repayment: {
            type: Number,
        },

        totalRepayment: {
            type: Number,
        },

        dti: {
            type: Number,
            default: null,
        },

        netValue: {
            type: Number,
            default: null,
        },

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        creditUser: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        agent: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        active: {
            type: Boolean,
            default: false,
        },

        booked: {
            type: Boolean,
        },

        disbursed: {
            type: Boolean,
            default: false,
        },

        params: {
            interestRate: {
                type: Number,
                required: true,
            },

            upfrontFeePercent: {
                type: Number,
                require: true,
            },

            transferFee: {
                type: Number,
                required: true,
            },

            maxDti: {
                type: Number,
                required: true,
            },

            minNetPay: {
                type: Number,
                required: true,
            },

            netPay: {
                type: Number,
            },

            age: {
                type: Number,
                default: null,
            },

            serviceLen: {
                type: Number,
                default: null,
            },
        },

        approveDenyDate: {
            type: Date,
        },

        dateLiquidated: {
            type: Date,
        },

        maturityDate: {
            type: String,
        },
    },
    schemaOptions
);

loanSchema.pre('save', function (next) {
    try {
        const isPresent = (path) => ['amount', 'tenor'].includes(path);
        if (this.modifiedPaths().some(isPresent)) {
            this.recommendedAmount = this.amount;
            this.recommendedTenor = this.tenor;
        }

        // setting loan metrics
        const hasTrigger = (path) =>
            ['recommendedAmount', 'recommendedTenor'].includes(path);
        if (this.modifiedPaths().some(hasTrigger)) {
            console.log('yes');
            
            this.upfrontFee = calcUpfrontFee(
                this.recommendedAmount,
                this.params.upfrontFeePercent
            );

            this.repayment = calcRepayment(
                this.recommendedAmount,
                this.params.interestRate,
                this.recommendedTenor
            );

            this.dti = calcDti(this.repayment, this.params.netPay);

            this.totalRepayment = calcTotalRepayment(
                this.repayment,
                this.recommendedTenor
            );

            this.netValue = calcNetValue(
                this.recommendedAmount,
                this.upfrontFee,
                this.params.transferFee
            );
        }

        next();
    } catch (exception) {
        logger.error({
            method: 'loan_pre_save',
            message: exception.message,
            meta: exception.meta,
        });
        next(new ServerError(500, 'Something went wrong'));
    }
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;

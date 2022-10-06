const mongoose = require('mongoose');
const {
    calcAge,
    calcDti,
    calcNetValue,
    calcRepayment,
    calcServiceLength,
    calcTotalRepayment,
    calcUpfrontFee,
} = require('../utils/LoanParams');
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
            enum: [
                'Approved',
                'Denied',
                'Pending',
                'On Hold',
                'Liquidated',
                'Discontinued',
                'Matured',
            ],
            default: 'Pending',
        },

        remark: {
            type: String,
            enum: [
                'Duplicate request',
                'Ok for disbursement',
                'Net pay below threshold',
                'Inconsistent net pay',
                'Incorrect IPPIS number',
                'Confirm recommended loan amount',
                'Confirm recommended tenor',
                'Confirm account number',
                'Confirm BVN',
                'Confirm BVN and account number',
                'Age above threshold',
                'Length of service above threshold',
                'Bad loan with other institution',
                'Department not eligible',
                'Negative net pay',
                'Not eligible for top up',
                'High exposure',
                'Name mismatch',
                'Net pay not available',
                'Client discontinued',
                'Failed to provide valid documentation',
            ],
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

        lenderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
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

            birthDate: {
                type: Date,
                default: null,
            },

            age: {
                type: Number,
                default: null,
            },

            hireDate: {
                type: Date,
                default: null,
            },

            serviceLength: {
                type: Number,
                default: null,
            },

            netPay: {
                type: Number,
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
        if (
            this.modifiedPaths().some((path) =>
                ['amount', 'tenor'].includes(path)
            )
        ) {
            this.recommendedAmount = this.amount;
            this.recommendedTenor = this.tenor;
        }

        // setting loan metrics
        const loanMetricsTriggers = ['recommendedAmount', 'recommendedTenor'];
        if (
            this.modifiedPaths().some((path) =>
                loanMetricsTriggers.includes(path)
            )
        ) {
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

        // updating params
        const paramsUpdateTrigger = ['repayment', 'params'];
        if (
            this.modifiedPaths().some((path) =>
                paramsUpdateTrigger.includes(path)
            )
        ) {
            console.log('I dey here');
            this.params.age = calcAge(this.params.birthDate);
            this.params.serviceLength = calcServiceLength(this.params.hireDate);
            this.dti = calcDti(
                this.repayment,
                this.params.netPay
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

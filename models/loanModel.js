const mongoose = require('mongoose');
const Metrics = require('../utils/LoanParams');
const logger = require('../utils/logger')('loanModel.js');
const ServerError = require('../errors/serverError');

// const metricFuncs = new Metrics();

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

        // agent: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     required: true,
        // },

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

            maxDti: {
                type: Number,
                required: true,
            },

            netPay: {
                type: Number,
            },

            minNetPay: {
                type: Number,
                required: true,
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

        const loanMetricsTriggers = ['recommendedAmount', 'recommendedTenor'];

        // setting loan metrics
        if (
            this.modifiedPaths().some((path) =>
                loanMetricsTriggers.includes(path)
            )
        ) {
            console.log('yes');
            this.upfrontFee = metricFuncs.calcUpfrontFee(
                this.recommendedAmount,
                this.upfrontFeePercent
            );
            this.repayment = metricFuncs.calcRepayment(
                this.recommendedAmount,
                this.interestRate,
                this.recommendedTenor
            );
            this.totalRepayment = metricFuncs.calcTotalRepayment(
                this.repayment,
                this.recommendedTenor
            );
            this.netValue = metricFuncs.calcNetValue(
                this.recommendedAmount,
                this.upfrontFee,
                this.transferFee
            );
        }

        const validationMetricTrigger = ['repayment', 'params'];

        // setting validation metics
        if (
            this.modifiedPaths().some((path) =>
                validationMetricTrigger.includes(path)
            )
        ) {
            console.log('I dey here');
            this.params.age = metricFuncs.age(this.params.dob);
            this.params.serviceLength = metricFuncs.serviceLength(
                this.params.doe
            );
            this.params.netPay.isValid =
                this.params.netPay >= this.params.minNetPay;
            this.params.dti = metricFuncs.calcDti(
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

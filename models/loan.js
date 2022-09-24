const mongoose = require('mongoose');
const Metrics = require('../utils/LoanParams');
const logger = require('../utils/logger')('loanModel.js');

const metricFuncs = new Metrics();

const schemaOptions = { timestamps: true, versionKey: false };

const loanSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true,
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

        loanType: {
            type: String,
            enum: ['New', 'Top Up'],
            default: 'New',
        },
        // End of the line where the user[loan agent] can edit.

        recommendedAmount: {
            type: Number,
            default: (self = this) => self.amount,
        },

        recommendedTenor: {
            type: Number,
            default: (self = this) => self.tenor,
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
        // End of the line where credit user can edit.

        loanAgent: mongoose.Schema.Types.ObjectId,

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
        // End of the line where admin user can edit

        // Below are set programmatically, no user can edit.
        upfrontFee: {
            type: Number,
        },

        repayment: {
            type: Number,
        },

        totalRepayment: {
            type: Number,
        },

        netValue: {
            type: Number,
            default: null,
        },

        dateApprovedOrDenied: {
            type: Date,
        },

        dateLiquidated: {
            type: Date,
        },

        maturityDate: {
            type: String,
        },

        customer: mongoose.Schema.Types.ObjectId,

        creditOfficer: mongoose.Schema.Types.ObjectId,

        lenderId: mongoose.Schema.Types.ObjectId,

        active: {
            type: Boolean,
            default: false,
        },

        booked: {
            type: Boolean,
            default: false,
        },

        disbursed: {
            type: Boolean,
            default: false,
        },

        params: {
            // Date of Birth
            dob: {
                type: Date,
                default: null,
            },

            age: {
                isValid: {
                    type: Boolean,
                    default: null,
                },

                age: {
                    type: Number,
                    default: null,
                },
            },

            // Date of Enlistment
            doe: {
                type: Date,
                default: null,
            },

            serviceLength: {
                isValid: {
                    type: Boolean,
                    default: null,
                },

                yearsServed: {
                    type: Number,
                    default: null,
                },
            },

            netPay: {
                isValid: {
                    type: Boolean,
                },

                value: {
                    type: Number,
                },
            },

            // TODO: should this be moved to the customer model?
            netPayConsistency: {
                type: Boolean,
                default: null,
            },

            dti: {
                type: Number,
                default: null,
            },

            maxDti: {
                type: Number,
                default: null,
            },

            minNetPay: {
                type: Number,
                default: null,
            },
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
                this.params.netPay.value >= this.params.minNetPay;
            this.params.dti = metricFuncs.calcDti(
                this.repayment,
                this.params.netPay.value
            );
        }

        next();
    } catch (exception) {
        logger.error({method: 'loan_pre_save', message: exception.message, meta: exception.meta });
        next({ errorCode: 500, message: 'Something went wrong' });
    }
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;

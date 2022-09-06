const mongoose = require('mongoose');
const User = require('../models/userModel');
const Lender = require('../models/lenderModel');
const Metrics = require('../tools/Managers/loanMetricsEval');

const loanMetricFuncs = new Metrics();

const schemaOptions = { timestamps: true, versionKey: false };

const loanSchema = new mongoose.Schema(
    {
        netPay: {
            type: Number,
            required: true,
        },

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

        comment: {
            type: String,
            default: null,
        },
        // End of the line where credit user can edit.

        loanAgent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

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

        metrics: {
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
                value: {
                    type: Number
                },
                valid:{
                    type: Boolean,
                }
            },

            // TODO: should this be moved to the customer model?
            netPayConsistency: {
                type: Boolean,
                default: null,
            },

            debtToIncomeRatio: {
                isValid: {
                    type: Boolean,
                    default: null,
                },

                value: {
                    type: Number,
                    default: null,
                },
            },
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

        creditOfficer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        lenderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lender',
        },

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
            dob: {
                type: Date,
                default: null,
            },

            doe: {
                type: Date,
                default: null,
            },

            minNetPay: {
                type: Number,
                default: null,
            },

            dtiThreshold: {
                type: Number,
                default: null,
            },
        },
    },
    schemaOptions
);

loanSchema.pre('save', function (next) {
    if (
        this.modifiedPaths().some((path) => ['amount', 'tenor'].includes(path))
    ) {
        this.recommendedAmount = this.amount;
        this.recommendedTenor = this.tenor;
    }

    const loanMetricsTriggers = ['recommendedAmount', 'recommendedTenor'];

    // setting loan metrics
    if (
        this.modifiedPaths().some((path) => loanMetricsTriggers.includes(path))
    ) {
        console.log('yes');
        this.upfrontFee = loanMetricFuncs.calcUpfrontFee(
            this.recommendedAmount,
            this.upfrontFeePercent
        );
        this.repayment = loanMetricFuncs.calcRepayment(
            this.recommendedAmount,
            this.interestRate,
            this.recommendedTenor
        );
        this.totalRepayment = loanMetricFuncs.calcTotalRepayment(
            this.repayment,
            this.recommendedTenor
        );
        this.netValue = loanMetricFuncs.calcNetValue(
            this.recommendedAmount,
            this.upfrontFee,
            this.transferFee
        );
    }

    const validationMetricTrigger = ['netPay', 'repayment', 'params'];

    // setting validation metics
    if (
        this.modifiedPaths().some((path) =>
            validationMetricTrigger.includes(path)
        )
    ) {
        console.log('I dey here');
        // Checking age validity
        this.metrics.age = loanMetricFuncs.ageValidator(this.params.dob);
        // Checking service length validity
        this.metrics.serviceLength =
            loanMetricFuncs.serviceLengthValidator(this.params.doe);
        // Checking net pay validity
        this.metrics.netPayValid = loanMetricFuncs.netPayValidator(
            this.netPay,
            this.params.minNetPay
        );
        // Calculating Debt-to-Income ratio
        this.metrics.debtToIncomeRatio = loanMetricFuncs.dtiRatioCalculator(
            this.repayment,
            this.netPay,
            this.params.dtiThreshold
        );
    }

    next();
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;

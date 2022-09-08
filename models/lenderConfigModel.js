const mongoose = require('mongoose');

const schemaOptions = { timestamps: true, versionKey: false };

const configSchema = new mongoose.Schema(
    {
        lenderId: {
            type: mongoose.Schema.Types.ObjectId,
            unique: true,
            required: true,
        },

        segments: [
            {
                id: {
                    type: String,
                    unique: true,
                },

                minLoanAmount: {
                    type: Number,
                    required: true,
                },
                maxLoanAmount: {
                    type: Number,
                    required: true,
                },
                minTenor: {
                    type: Number,
                    required: true,
                },
                maxTenor: {
                    type: Number,
                    required: true,
                },
                maxDti: {
                    type: Number,
                    // required: true
                },

                useDefault: {
                    type: Boolean,
                    required: true,
                },
            },
        ],

        loanParams: {
            interestRate: {
                type: Number,
                required: true,
            },

            upfrontFeePercent: {
                type: Number,
                required: true,
            },

            transferFee: {
                type: Number,
                required: true,
            },

            minNetPay: {
                type: Number,
                required: true,
            },

            maxDti: {
                type: Number,
                required: true,
            },
        },
    },
    schemaOptions
);

configSchema.pre('save', function (next) {
    // Convert interest rate to decimal value.
    if (this.modifiedPaths().includes('loanParams.interestRate'))
        this.loanParams.interestRate = (
            this.loanParams.interestRate / 100
        ).toFixed(5);

    // Convert upfront fee percentage to decimal value.
    if (this.modifiedPaths().includes('loanParams.upfrontFeePercent'))
        this.loanParams.upfrontFeePercent = (
            this.loanParams.upfrontFeePercent / 100
        ).toFixed(5);

    // Convert maximum DTI to decimal value.
    if (this.modifiedPaths().includes('loanParams.maxDti')) {
        this.loanParams.maxDti = (this.loanParams.maxDti / 100).toFixed(5);
        this.segments.forEach((segment) => {
            if (segment.useDefault) segment.maxDti = this.loanParams.maxDti;
        });
    }

    if (this.modifiedPaths().includes('segments')) {
        this.segments.forEach((segment) => {
            if (!segment.maxDti) {
                segment.maxDti = this.loanParams.maxDti;
                segment.useDefault = true;
            }
            if (segment.maxDti > 1)
                segment.maxDti = (segment.maxDti / 100).toFixed(5);
        });
    }

    next();
});

const LenderConfig = mongoose.model('LenderConfig', configSchema);

module.exports = LenderConfig;

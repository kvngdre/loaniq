const mongoose = require('mongoose');
const Lender = require('../models/lenderModel');
const Segment = require('../models/segmentModel');

const schemaOptions = { timestamps: true, versionKey: false};

const configSchema = new mongoose.Schema(
    {
        lenderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lender',
            unique: true,
            required: true,
        },

        segments: [
            {
                segment: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Segment',
                    unique: true,
                },

                minLoanAmount: {
                    type: Number,
                },
                maxLoanAmount: {
                    type: Number,
                },
                minTenor: {
                    type: Number,
                },
                maxTenor: {
                    type: Number,
                },
            },
        ],

        loanMetrics: {
            interestRate: {
                type: Number,
                // required: true
            },

            upfrontFeePercent: {
                type: Number,
                // required: true
            },

            transferFee: {
                type: Number,
                // required: true
            },

            minNetPay: {
                type: Number,
                // required: true
            },

            dtiThreshold: {
                type: Number,
                // required: true
            },
        },
    },
    schemaOptions
);

const LenderConfig = mongoose.model('LenderConfig', configSchema);

module.exports = LenderConfig;

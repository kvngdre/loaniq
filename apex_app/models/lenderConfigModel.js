const mongoose = require('mongoose');
const Lender = require('../models/lenderModel');
const Segment = require('../models/segmentModel');


const configSchema = new mongoose.Schema({
    lenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lender',
        required: true
    },

    segments: [{
            segment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Segment'
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
            }
        }],

    loanMetrics: {
        interestRate: {
            type: Number,
            required: true
        },

        upfrontFeePercentage: {
            type: Number,
            required: true
        },

        transferFee: {
            type: Number,
            required: true
        },

        minNetPay: {
            type: Number,
            required: true
        },

        dtiThreshold: {
            type: Number,
            required: true
        }
    }
});

const LenderConfig = mongoose.model('LenderConfig', configSchema);

module.exports = LenderConfig;

// TODO: Min max loan amount
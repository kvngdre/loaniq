const mongoose = require('mongoose');
const Lender = require('../models/lenderModel');

const configSchema = new mongoose.Schema({
    lenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lender',
        required: true
    },

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

        minLoanAmount: {
            type: Number,
            required: true
        },

        maxLoanAmount: {
            type: Number,
            required: true
        },

        minNetPay: {
            type: Number,
            required: true
        },

        minTenor: {
            type: Number,
            required: true
        },

        maxTenor: {
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
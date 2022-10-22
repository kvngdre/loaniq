const { txnStatus } = require('../utils/constants');
const crypto = require('crypto');
const mongoose = require('mongoose');

const schemaOptions = { timestamps: true, versionKey: false };

const transactionSchema = new mongoose.Schema(
    {
        lender: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        txnId: {
            type: String,
            default: null,
        },

        gateway: {
            type: String,
            default: null,
        },

        status: {
            type: String,
            enum: Object.values(txnStatus),
            required: true,
        },

        reference: {
            type: String,
            unique: true,
            default: () => crypto.randomBytes(4).toString('hex'),
        },

        category: {
            type: String,
            enum: ['Debit', 'Credit'],
            required: true,
        },

        desc: {
            type: String,
            default: null,
        },

        channel: {
            type: String,
            default: null,
        },

        bank: {
            type: String,
            default: null,
        },

        cardType: {
            type: String,
            default: null,
        },

        amount: {
            type: Number,
            required: true,
        },

        currency: {
            type: String,
            default: 'NGN',
        },

        fee: {
            type: Number,
            default: null,
        },

        balance: {
            type: Number,
            required: true,
        },

        paidAt: {
            type: Date,
            default: null,
        },

        modifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
    },
    schemaOptions
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

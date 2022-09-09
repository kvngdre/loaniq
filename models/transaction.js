const mongoose = require('mongoose');

const schemaOptions = { timestamps: true, versionKey: false };

const transactionSchema = new mongoose.Schema(
    {
        lenderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        id: {
            type: String,
            default: null
        },

        provider: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            required: true,
        },

        reference: {
            type: String,
            unique: true,
        },

        category: {
            type: String,
            enum: ['Debit', 'Credit'],
            required: true,
        },

        description: {
            type: String,
            default: null,
        },

        channel: {
            type: String,
            default: null,
        },

        bankName: {
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
        },

        balance: {
            type: Number,
            required: true,
        },

        paidAt: {
            type: Date,
            default: null,
        },
    },
    schemaOptions
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

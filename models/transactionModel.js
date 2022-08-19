const mongoose = require('mongoose');

const schemaOptions = { timestamps: true };

const transactionSchema = new mongoose.Schema(
    {
        lenderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        status: {
            type: String,
            required: true,
        },

        reference: {
            type: String,
        },

        type: {
            type: String,
            enum: ['Debit', 'Credit'],
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        channel: {
            type: String,
            default: null,
        },

        bank: {
            type: String,
            default: null,
        },

        amount: {
            type: Number,
            required: true,
        },

        fees: {
            type: Number,
        },

        balance: {
            type: Number,
            required: true,
        },
    },
    schemaOptions
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

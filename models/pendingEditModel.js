const mongoose = require('mongoose');

const schemaOptions = { strict: false, timestamps: true };

const pendingSchema = new mongoose.Schema(
    {
        lenderId: {
            type: String,
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        type: {
            type: String,
            enum: ['Customer', 'Loan'],
            required: true,
        },

        status: {
            type: String,
            enum: ['Approved', 'Denied', 'Pending'],
            default: 'Pending',
        },

        remark: {
            type: String,
            trim: true,
        },
    },
    schemaOptions
);

const Pending = mongoose.model('PendingEdit', pendingSchema);

module.exports = Pending;

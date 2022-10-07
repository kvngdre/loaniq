const mongoose = require('mongoose');

const schemaOptions = { strict: false, timestamps: true, versionKey: false };

const pendingSchema = new mongoose.Schema(
    {
        lender: {
            type: String,
            required: true,
        },

        docId: {
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
            default: null,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        modifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
    },
    schemaOptions
);

const Pending = mongoose.model('PendingEdit', pendingSchema);

module.exports = Pending;

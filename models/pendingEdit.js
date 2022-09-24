const mongoose = require('mongoose');

const schemaOptions = { strict: false, timestamps: true, versionKey: false };

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

        modifiedBy: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            role: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                required: true
            },
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

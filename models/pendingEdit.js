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

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            default: function () {
                return this.userId;
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

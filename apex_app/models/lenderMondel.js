const mongoose = require('mongoose');
const { DateTime } = require('luxon');


const lenderSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true,
    },

    companyAddress: {
        type: String,
        required: true,
        minLength: 10,
        maxLength: 255,
        trim: true
    },

    cacNumber: {
        type: String,
        required: true
    },

    category: {
        type: String,
        enum: ['MFB', 'MFI', 'Money lender'],
        default: 'MFB'
    },

    phone: {
        type: String,
        length: 11,
        trim: true
    },

    lenderURL: {
        type: String,
        trim: true
    },

    adminUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },

    createdAt: {
        type: Date,
        default: () => DateTime.now().toISO()
    }
},
{
    timestamps: true
});

const Lender = mongoose.model('Lender', lenderSchema);

module.exports = Lender;

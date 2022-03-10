const mongoose = require('mongoose');


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

    email: {
        type: String,
        required: true
    },

    lenderURL: {
        type: String,
        trim: true
    },

    adminUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
    
}, {
    timestamps: true
});

const Lender = mongoose.model('Lender', lenderSchema);

module.exports = Lender;

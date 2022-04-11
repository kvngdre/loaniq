const mongoose = require('mongoose');
const User = require('./userModel');

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
        required: true,
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
        unique: true,
        required: true
    },

    password: {
        type: String,
        minLength: 6,
        maxLength: 1024,
        required: true
    },

    // TODO: Work on auto generating url
    lenderURL: {
        type: String,
        lowercase: true,
        trim: true
    },
    // Should there be more than one admin?
    adminUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    
    // TODO: Add OTP verification
    
}, {
    timestamps: true
});

lenderSchema.methods.generateToken = function() {
    return jwt.sign( {
        lenderId: this._id, 
        companyName: this.companyName, 
        lastName: this.name.lastName,
        email: this.email,
    }, 'jwtPrivateKey');
}

const Lender = mongoose.model('Lender', lenderSchema);

module.exports = Lender;

const mongoose = require('mongoose');
const User = require('./userModel');
const jwt = require('jsonwebtoken');

const lenderSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true,
    },

    slug: {
        type: String,
        unique: true,
        required: true
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
        trim: true,
        required: true
    },

    password: {
        type: String,
        minLength: 6,
        maxLength: 1024,
        required: true
    },

    otp: {
        type: String
    },

    active: {
        type: Boolean
    },

    role: {
        type: String,
        default: 'lender'
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

}, {
    timestamps: true
}); 

lenderSchema.methods.generateToken = function() {
    return jwt.sign( {
        lenderId: this._id, 
        companyName: this.companyName, 
        email: this.email,
        phone: this.phone,
        role: this.role,
    }, 'jwtPrivateKey');
}

const Lender = mongoose.model('Lender', lenderSchema);

module.exports = Lender;

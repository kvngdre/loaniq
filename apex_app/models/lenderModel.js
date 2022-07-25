const jwt = require('jsonwebtoken');
const User = require('./userModel');
const mongoose = require('mongoose');
const moment = require('moment-timezone')


const schemaOptions = {timestamps: true, toJSON: {virtuals: true}, id: false};

const lenderSchema = new mongoose.Schema({
    companyName: {
        type: String,
        trim: true,
        required: true,
    },

    companyAddress: {
        type: String,
        trim: true,
        minLength: 10,
        maxLength: 255,
        required: true
    },

    cacNumber: {
        type: String,
        required: true
    },

    category: {
        type: String,
        enum: [
            'MFB', 
            'Finance House', 
            'Money Lender'
        ],
    },

    phone: {
        type: String,
        length: 11,
        trim: true,
        required: true
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
        OTP: {
            type: String,
        },
        
        expirationTime: {
            type: Number,
        }
    },

    active: Boolean,

    role: {
        type: String,
        default: 'Lender'
    },

    balance: {
        type: Number,
        default: 0
    },

    lastReferenceCode: String,

    // TODO: Work on auto generating url
    lenderURL: {
        type: String,
        trim: true,
        lowercase: true,
    },
    // TODO: Should there be more than one admin?
    adminUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    lastLoginTime: {
        type: Date,
        default: null
    }

}, schemaOptions); 

lenderSchema.virtual('createdAtTZAdjusted').get(function() {
    return moment.tz(this.createdAt, this.timeZone).format();
})

lenderSchema.virtual('updatedAtTZAdjusted').get(function() {
    return moment.tz(this.updatedAt, this.timeZone).format();
})

lenderSchema.virtual('lastLoginTimeTZAdjusted').get(function() {
    if(!this.lastLoginTime) return null;
    return moment.tz(this.lastLoginTime, this.timeZone).format();
})

lenderSchema.methods.generateToken = function() {
    return jwt.sign({
        lenderId: this._id, 
        companyName: this.companyName, 
        email: this.email,
        phone: this.phone,
        role: this.role,
        balance: this.balance,
        adminUser: !!this.adminUser,
        lastLoginTime: this.lastLoginTime
    }, 
    process.env.JWT_PRIVATE_KEY);
}

const Lender = mongoose.model('Lender', lenderSchema);

module.exports = Lender;
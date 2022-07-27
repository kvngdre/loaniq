const config = require('config')
const jwt = require('jsonwebtoken')
const User = require('./userModel')
const mongoose = require('mongoose')
const moment = require('moment-timezone')
// const AutoIncrement = require('mongoose-sequence')(mongoose)


const schemaOptions = {timestamps: true, versionKey: false, toJSON: {virtuals: true}};

const lenderSchema = new mongoose.Schema({
    // id: {
    //     type: Number,
    //     unique: true
    // },

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
        unique: true,
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

    emailVerified: {
        type: Boolean,
        default: false
    },

    active: {
        type: Boolean,
        default: false
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

    role: {
        type: String,
        default: 'Lender'
    },

    balance: {
        type: Number,
        default: 0
    },

    lastReferenceCode: {
        type: String,
        default: null
    },

    // TODO: Work on auto generating url
    lenderURL: {
        type: String,
        trim: true,
        lowercase: true,
        default: null
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
    },

    timeZone: {
        type: String,
        default: 'Africa/Lagos'
    }

}, schemaOptions); 

// lenderSchema.plugin(AutoIncrement, {inc_field: 'id'})

lenderSchema.virtual('createdAtTZAdjusted').get( function() {
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
        active: this.active,
        emailVerified: this.emailVerified,
        role: this.role,
        balance: this.balance,
        adminUser: !!this.adminUser,
        lastLoginTime: this.lastLoginTimeTZAdjusted
    }, config.get('jwt_secret'));
}

const Lender = mongoose.model('Lender', lenderSchema);

module.exports = Lender;
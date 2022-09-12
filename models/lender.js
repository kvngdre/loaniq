const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
// const AutoIncrement = require('mongoose-sequence')(mongoose)

const schemaOptions = { timestamps: true, versionKey: false };

const lenderSchema = new mongoose.Schema(
    {
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
            required: true,
        },

        cacNumber: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            enum: ['MFB', 'Finance House', 'Money Lender'],
        },

        phone: {
            type: String,
            unique: true,
            length: 11,
            trim: true,
            required: true,
        },

        email: {
            type: String,
            unique: true,
            trim: true,
            required: true,
        },

        emailVerified: {
            type: Boolean,
            default: false,
        },

        active: {
            type: Boolean,
            default: false,
        },

        password: {
            type: String,
            minLength: 6,
            maxLength: 1024,
            required: true,
        },

        otp: {
            OTP: {
                type: String,
            },

            expires: {
                type: Number,
            },
        },

        role: {
            type: String,
            default: 'Lender',
        },

        balance: {
            type: Number,
            default: 0,
        },

        // TODO: Work on auto generating url
        lenderURL: {
            type: String,
            trim: true,
            lowercase: true,
            default: null,
        },
        // TODO: Should there be more than one admin?
        publicUrl: {
            // This should be the short url.
            type: String,
            default: null,
        },

        support: {
            email: {
                type: String,
                default: null
            },

            phone: {
                type: String,
                default: null
            }
        },

        lastCreditDate: {
            type: Date,
            default: null,
        },

        requestCounter: {
            type: Number,
            default: 0,
        },

        lastLoginTime: {
            type: Date,
            default: null,
        },

        timeZone: {
            type: String,
            default: 'Africa/Lagos',
        },
    },
    schemaOptions
);

// lenderSchema.plugin(AutoIncrement, {inc_field: 'id'})

lenderSchema.methods.generateToken = function () {
    return jwt.sign(
        {   
            id: this._id,
            lenderId: this._id,
            email: this.email,
            active: this.active,
            emailVerified: this.emailVerified,
            role: this.role,
            balance: this.balance,
            lastLoginTime: this.lastLoginTime,
        },
        config.get('jwt_secret')
    );
};

const Lender = mongoose.model('Lender', lenderSchema);

module.exports = Lender;

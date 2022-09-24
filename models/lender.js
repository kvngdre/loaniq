const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const schemaOptions = { timestamps: true, versionKey: false };

const lenderSchema = new mongoose.Schema(
    {
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
            unique: true,
            required: true,
        },

        category: {
            type: String,
            enum: ['MFB', 'Finance House', 'Money Lender'],
        },

        phone: {
            type: String,
            unique: true,
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

        website: {
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

        urlId: {
            type: Number,
            unique: true,
        },

        support: {
            email: {
                type: String,
                trim: true,
                required: true,
            },

            phone: {
                type: String,
                default: null,
            },
        },

        social: {
            twitter: {
                type: String,
                default: null
            },
            instagram: {
                type: String,
                default: null
            },
            facebook: {
                type: String,
                default: null
            },
            whatsApp: {
                type: String,
                default: null
            },
            YouTube: {
                type: String,
                default: null
            },
            tiktok: {
                type: String,
                default: null
            },
        },

        lastCreditDate: {
            type: Date,
            default: null,
        },

        requestCount: {
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

lenderSchema.plugin(AutoIncrement, { inc_field: 'urlId' });

lenderSchema.methods.generateAccessToken = function () {
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
        config.get('jwt_secret'),
        { expiresIn: '10m' }
    );
};

lenderSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        email: this.email,
    }, config.get('jwt_refresh'), { expiresIn: '8h' });
};

const Lender = mongoose.model('Lender', lenderSchema);

module.exports = Lender;

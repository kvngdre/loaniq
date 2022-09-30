const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { roles } = require('../utils/constants');

const schemaOptions = { timestamps: true, versionKey: false };

const lenderSchema = new mongoose.Schema(
    {
        logo: {
            type: String
        },
        
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
            default: true,
        },

        otp: {
            OTP: {
                type: String,
            },

            expires: {
                type: Number,
            },
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
                default: null,
            },
            instagram: {
                type: String,
                default: null,
            },
            facebook: {
                type: String,
                default: null,
            },
            whatsapp: {
                type: String,
                default: null,
            },
            youtube: {
                type: String,
                default: null,
            },
            tiktok: {
                type: String,
                default: null,
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

        loanParams: {
            minLoanAmount: {
                type: Number,
                default: null,
            },

            maxLoanAmount: {
                type: Number,
                default: null,
            },

            minTenor: {
                type: Number,
                default: null,
            },

            maxTenor: {
                type: Number,
                default: null,
            },
            
            interestRate: {
                type: Number,
                default: null,
            },

            upfrontFeePercent: {
                type: Number,
                default: null,
            },

            transferFee: {
                type: Number,
                default: null,
            },

            minNetPay: {
                type: Number,
                default: null,
            },

            maxDti: {
                type: Number,
                default: null,
            },
        },

        segments: [
            {
                id: {
                    type: String,
                    unique: true,
                    sparse: true
                },

                minLoanAmount: {
                    type: Number,
                },

                maxLoanAmount: {
                    type: Number,
                },

                minTenor: {
                    type: Number,
                },

                maxTenor: {
                    type: Number,
                },
                
                interestRate: {
                    type: Number,
                },
    
                upfrontFeePercent: {
                    type: Number,
                },
    
                transferFee: {
                    type: Number,
                },
    
                minNetPay: {
                    type: Number,
                },
    
                maxDti: {
                    type: Number,
                },

            },
        ],


    },
    schemaOptions
);

lenderSchema.plugin(AutoIncrement, { inc_field: 'urlId' });

const Lender = mongoose.model('Lender', lenderSchema);

module.exports = Lender;

const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

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
            address: {
                type: String,
                trim: true,
                required: true
            },
            lga: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
        },

        cacNumber: {
            type: String,
            unique: true,
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

        otp: {
            OTP: {
                type: String,
                default: null
            },

            exp: {
                type: Number,
                default: null
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
                default: null
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
                    type: mongoose.Schema.Types.ObjectId,
                    unique: true,
                    sparse: true
                },

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
        ],


    },
    schemaOptions
);

lenderSchema.plugin(AutoIncrement, { inc_field: 'urlId' });

const Lender = mongoose.model('Lender', lenderSchema);

module.exports = Lender;

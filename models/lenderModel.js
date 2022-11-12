const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const ServerError = require('../errors/serverError');

const schemaOptions = { timestamps: true, versionKey: false };

const lenderSchema = new mongoose.Schema(
    {
        logo: {
            type: String,
            default: null,
        },

        companyName: {
            type: String,
            trim: true,
            required: true,
        },

        location: {
            address: {
                type: String,
                trim: true,
                default: null,
            },
            lga: {
                type: String,
                default: null,
            },
            state: {
                type: String,
                default: null,
            },
        },

        cacNumber: {
            type: String,
            unique: true,
            sparse: true,
        },

        // directors: [
        //     {
        //         name: {
        //             type: String
        //         },
        //         email: {
        //             type: String,
        //         },
        //         id: {
        //             type: String
        //         }
        //     }
        // ],

        category: {
            type: String,
            enum: ['MFB', 'Finance House', 'Money Lender'],
        },

        phone: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },

        email: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
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
                default: null,
            },

            exp: {
                type: Number,
                default: null,
            },
        },

        balance: {
            type: Number,
            default: 0,
        },

        website: {
            type: String,
            default: null,
            trim: true,
            lowercase: true,
        },

        // TODO: Should there be more than one admin?
        publicUrl: {
            // This should be the short url.
            type: String,
            unique: true,
            sparse: true,
        },

        support: {
            email: {
                type: String,
                trim: true,
                default: null,
            },

            phone: {
                type: String,
                default: null,
            },
        },

        social: {
            twitter: {
                url: {
                    type: String,
                    default: null,
                },
                active: {
                    type: Boolean,
                    default: false,
                },
            },
            instagram: {
                url: {
                    type: String,
                    default: null,
                },
                active: {
                    type: Boolean,
                    default: false,
                },
            },
            facebook: {
                url: {
                    type: String,
                    default: null,
                },
                active: {
                    type: Boolean,
                    default: false,
                },
            },
            whatsapp: {
                url: {
                    type: String,
                    default: null,
                },
                active: {
                    type: Boolean,
                    default: false,
                },
            },
            youtube: {
                url: {
                    type: String,
                    default: null,
                },
                active: {
                    type: Boolean,
                    default: false,
                },
            },
            tiktok: {
                url: {
                    type: String,
                    default: null,
                },
                active: {
                    type: Boolean,
                    default: false,
                },
            },
        },

        lastCreditDate: {
            type: Date,
            default: null,
        },

        lastReqDate: {
            type: Date,
            default: null,
        },

        requestCount: {
            type: Number,
            default: 0,
        },

        totalCost: {
            type: Number,
            default: 0,
        },

        defaultParams: {
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
                    sparse: true,
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

lenderSchema.methods.generateToken = function () {
    return jwt.sign(
        {
            lender: this._id.toString(),
        },
        config.get('jwt.secret.access'),
        {
            audience: config.get('jwt.audience'),
            expiresIn: parseInt(config.get('jwt.expTime.form')),
            issuer: config.get('jwt.issuer'),
        }
    );
};

const Lender = mongoose.model('Lender', lenderSchema);

module.exports = Lender;

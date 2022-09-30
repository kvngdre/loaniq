const {
    relationships,
    maritalStatus,
    validIds,
} = require('../utils/constants');
const debug = require('debug')('app:customerModel');
const Loan = require('./loan');
const mongoose = require('mongoose');
const Segment = require('./segment');

const schemaOptions = { timestamps: true, versionKey: false };

const addressSchema = {
    street: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
    },

    state: {
        type: String,
        required: true,
    },

    stateCode: {
        type: String,
        uppercase: true,
        required: true,
    },

    lga: {
        type: String,
        required: true,
    },

    geo: {
        type: String,
        required: true,
    },
};

const customerSchema = new mongoose.Schema(
    {
        passport: {
            path: {
                type: String,
                default: null,
            },

            originalName: {
                type: String,
                default: null,
            },
        },

        name: {
            first: {
                type: String,
                minLength: 3,
                maxLength: 50,
                trim: true,
                required: true,
            },

            last: {
                type: String,
                minLength: 3,
                maxLength: 50,
                trim: true,
                required: true,
            },

            middle: {
                type: String,
                minLength: 3,
                maxLength: 50,
                trim: true,
            },
        },

        fullName: {
            type: String,
            default: function () {
                return this.name.first.concat(
                    this.name.middle ? ` ${this.name.middle}` : '',
                    ` ${this.name.last}`
                );
            },
        },

        gender: {
            type: String,
            enum: ['Male', 'Female'],
            required: true,
        },

        // TODO: work on exception return
        dateOfBirth: {
            type: Date,
            required: true,
        },

        residentialAddress: addressSchema,

        contactInfo: {
            phone: {
                type: String,
                trim: true,
                required: true,
            },

            email: {
                type: String,
                lowercase: true,
                trim: true,
                default: null,
            },
        },

        maritalStatus: {
            type: String,
            enum: maritalStatus,
            required: true,
        },

        bvn: {
            type: String,
            unique: true,
            trim: true,
            required: true,
        },

        idCard: {
            path: {
                type: String,
                default: null,
            },

            originalName: {
                type: String,
                default: null,
            },
        },

        idCardInfo: {
            idType: {
                type: String,
                enum: validIds,
                required: true,
            },

            idNumber: {
                type: String,
                minLength: 4,
                maxLength: 50,
                trim: true,
                required: true,
            },
        },

        employmentInfo: {
            name: {
                type: String,
                minLength: 3,
                maxLength: 255,
                trim: true,
                required: true,
            },

            depart: {
                type: String,
                trim: true,
            },

            segment: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },

            ippis: {
                type: String,
                uppercase: true,
                unique: true,
                trim: true,
                required: true,
                validate: {
                    validator: async function (value) {
                        const segment = await Segment.findById(
                            this.employmentInfo.segment
                        );
                        if (!segment) throw new Error('Segment not found');

                        const ippisPrefix = value.match(/^[A-Z]{2,3}(?=[0-9])/);

                        if (segment.ippisPrefix !== ippisPrefix[0])
                            return false;

                        return true;
                    },
                    message: 'IPPIS Number does not match segment selected',
                },
            },

            companyLocation: addressSchema,

            dateOfEnlistment: {
                type: Date,
                required: true,
            },
        },

        nok: {
            fullName: {
                type: String,
                trim: true,
                required: true,
            },

            address: addressSchema,

            phone: {
                type: String,
                trim: true,
                required: true,
            },

            relationship: {
                type: String,
                enum: relationships,
                required: true,
            },
        },

        accountInfo: {
            accountName: {
                type: String,
                lowercase: true,
                required: true,
                trim: true,
            },

            accountNumber: {
                type: String,
                trim: true,
                required: true,
            },

            bank: {
                name: {
                    type: String,
                    required: true,
                },

                code: {
                    type: String,
                    maxLength: 6,
                    required: true,
                },
            },
        },

        // below are set programmatically. No user can edit.
        netPay: {
            // TODO: should this just copy the net pay array from origin?
            type: Number,
            default: 80_000.27,
        },

        bvnValid: {
            type: Boolean,
            default: false,
        },

        isValidAccNum: {
            type: Boolean,
            default: null,
        },

        lenders: {
            type: [String],
            default: null,
        },
    },
    schemaOptions
);

customerSchema.methods.validateSegment = async function () {
    try {
        const segment = await Segment.findById(this.employmentInfo.segment);
        if (!segment) return { error: { message: 'Segment not found' } };

        const ippisPrefix =
            this.employmentInfo.ippis.match(/^[A-Z]{2,3}(?=[0-9])/); // matches only the letters prefix
        if (segment.ippisPrefix !== ippisPrefix[0])
            return {
                error: {
                    message: 'IPPIS number does not match segment selected.',
                },
            };

        return true;
    } catch (exception) {
        debug(exception);
        return exception;
    }
};

customerSchema.methods.addLender = function (lender) {
    const lenders = new Set(this.lenders);
    lenders.add(lender);
    this.lenders = Array.from(lenders);
};

customerSchema.methods.removeLender = function (lender) {
    const lenders = new Set(this.lenders);
    lenders.delete(lender);
    this.lenders = Array.from(lenders);
};

customerSchema.pre('save', async function (next) {
    const loanEditTrigger = ['dateOfBirth', 'employmentInfo.dateOfEnlistment'];

    if (!this.isNew && this.modifiedPaths().some((path) => loanEditTrigger.includes(path))) {
        console.log('triggered');

        const loans = await Loan.find({
            customer: this._id,
            status: 'Pending',
        });
        if (loans.length > 0) {
            loans.forEach(async (loan) => {
                loan.set({ 'params.dob': this.dateOfBirth });
                loan.set({
                    'params.doe': this.employmentInfo.dateOfEnlistment,
                });
                await loan.save();
            });
        }
    }

    next();
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;

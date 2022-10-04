const {
    relationships,
    maritalStatus,
    validIds,
} = require('../utils/constants');
const debug = require('debug')('app:customerModel');
const Loan = require('./loanModel');
const logger = require('../utils/logger')('customerModel.js');
const mongoose = require('mongoose');
const Segment = require('./segmentModel');
const ServerError = require('../errors/serverError');

const schemaOptions = { timestamps: true, versionKey: false };

const customerSchema = new mongoose.Schema(
    {
        lenderId: {
            type: String,
            required: true,
        },

        passport: {
            type: String,
            default: null,
        },
        idCard: {
            type: String,
            default: null,
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

        birthDate: {
            type: Date,
            required: true,
        },

        residentialAddress: {
            address: {
                type: String,
                trim: true,
                maxLength: 255,
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
        },

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

        maritalStatus: {
            type: String,
            enum: maritalStatus,
            required: true,
        },

        bvn: {
            type: String,
            trim: true,
            required: true,
        },

        ippis: {
            type: String,
            uppercase: true,
            trim: true,
            required: true,
            validate: {
                validator: async function (value) {
                    const segment = await Segment.findOne({ _id: this.employer.segment, active: true });
                    if (!segment) return new ServerError('Segment not found');

                    const ippisPrefix = value.match(/^[A-Z]{2,3}(?=[0-9])/);
                    if (segment.ippisPrefix !== ippisPrefix[0]) return false;

                    return true;
                },
                message: 'IPPIS number does not match segment selected',
            },
        },

        idType: {
            type: String,
            enum: validIds,
            required: true,
        },

        idNo: {
            type: String,
            minLength: 4,
            maxLength: 50,
            trim: true,
            required: true,
        },

        employer: {
            name: {
                type: String,
                minLength: 3,
                maxLength: 255,
                trim: true,
                required: true,
            },

            command: {
                type: String,
                trim: true,
                default: null,
            },

            segment: {
                type: String,
                required: true,
            },

            location: {
                address: {
                    type: String,
                    trim: true,
                    maxLength: 255,
                    lowercase: true,
                    required: true,
                },

                state: {
                    type: String,
                    required: true,
                },

                lga: {
                    type: String,
                    required: true,
                },
            },

            hireDate: {
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

            location: {
                address: {
                    type: String,
                    trim: true,
                    maxLength: 255,
                    lowercase: true,
                    required: true,
                },

                state: {
                    type: String,
                    required: true,
                },
                lga: {
                    type: String,
                    required: true,
                },
            },

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

        accountName: {
            type: String,
            lowercase: true,
            required: true,
            trim: true,
        },

        accountNo: {
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

        // below are set programmatically. No user can edit.
        netPay: {
            type: Number,
            default: 80_000.27,
        },

        validBvn: {
            type: Boolean,
        },

        validAccNo: {
            type: Boolean,
        },

        agent: {
            type: String,
            default: null,
        },
    },
    schemaOptions
);

// compound index on lender id, ippis, and bvn
customerSchema.index({ ippis: 1, bvn: 1, accountNo: 1 }, { unique: true, partialFilterExpression: { $eq: this.hospital_id} });

customerSchema.methods.validateSegment = async function () {
    try {
        const segment = await Segment.findOne({ code: this.employer.segment });
        if (!segment) return { error: { message: 'Segment not found' } };

        const ippisPrefix = this.ippis.match(/^[A-Z]{2,3}(?=[0-9])/); // matches only the letters prefix
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

customerSchema.pre('save', async function (next) {
    try {
        const loanEditTrigger = ['birthDate', 'employer.hireDate'];
        if (
            !this.isNew &&
            this.modifiedPaths().some((path) => loanEditTrigger.includes(path))
        ) {
            console.log('triggered');

            const foundLoans = await Loan.find({
                lenderId: this.lenderId,
                customer: this._id,
                status: 'Pending',
            });
            if (foundLoans.length > 0) {
                foundLoans.forEach(async (loan) => {
                    loan.set({
                        'params.birthDate': this.birthDate,
                        'params.hireDate': this.employer.hireDate,
                    });

                    await loan.save();
                });
            }
        }

        next();
    } catch (exception) {
        logger.error({
            method: 'customer_pre_save',
            message: exception.message,
            meta: exception.meta,
        });
        next(new ServerError(500, 'Something went wrong'));
    }
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;

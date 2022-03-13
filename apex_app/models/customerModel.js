const Loan = require('./loanModel');
const mongoose = require('mongoose');
const Bank = require('../models/bankModel');
const State = require('../models/stateModel');
const Segment = require('../models/segmentModel');
const debug = require('debug')('app:customerModel');


const customerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minLength: 3,
        maxLength: 50,
        required: true,
        trim:true
    },

    lastName: {
        type: String,
        minLength: 3,
        maxLength: 50,
        required: true,
        trim:true
    },

    middleName: {
        type: String,
        default: null,
        // minLength: 3,
        maxLength: 50,
        trim:true
    },
    
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female'],
        default: 'Male'
    },

    // TODO: work on exception return 
    dateOfBirth: {
        type: Date,
        required: true,
        validate: {
            // Validate age is over 21
            validator: (dob) => {
                try{
                    const dob_ = new Date(dob);
    
                    // Get the milliseconds between dates.
                    const month_diff = Date.now() - dob_.getTime();
    
                    // Convert to date format
                    const ageDate = new Date(month_diff);
    
                    // Get age year
                    const ageYear = ageDate.getUTCFullYear();
    
                    const age = ageYear - 1970;

                    return age >= 21 && age <= 60;

                }catch(exception) {
                    debug(exception.message);
                    return false;
                };
            },
            // TODO: research how to get to the age constant in the validator.
            message: "Age should be minimum 21."
        },
    },

    residentialAddress: {
        type: String,
        // required: true,
        minLength: 5,
        maxLength: 255,
        trim: true,
        lowercase: true
    },

    stateResident: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        required: true
    },
    
    maritalStatus: {
        type: String,
        enum: [
            'Single',
            'Married',
            'Divorced',
            'Separated',
            'Widow',
            'Widower'
        ],
        default: 'Single',
        required: true,
        trim: true
    },
    // TODO: uncomment required and unique.
    phone: {
        type: String,
        required: true,
        default: null,
        // unique: true,
        trim: true,
    },

    email: {
        type: String,
        lowercase: true,
        unique: true,
        trim: true
    },

    bvn: {
        type: Number,
        lowercase: true,
        unique: true,
        trim: true
    },

    validId: {
        type: String,
        enum: [
            "Voters card",
            "International passport",
            "Staff ID card",
            "National ID card",
            "Driver's license"
        ],
        // required: true
    },

    idNumber: {
        type: String,
        // required: true,
        minLength: 4,
        maxLength: 50,
        trim: true
    },

    ippis: {
        type: String,
        // required: true,
        unique: true,
        uppercase: true
    },

    companyName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Segment',
        required: true,
    },

    companyLocation: {
        type: String,
        // required: true,
        minLength: 6,
        maxLength: 255,
        lowercase: true,
        trim: true
    },

    companyState:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        // required: true
    },

    dateOFEnlistment: {
        type: Date,
        // required: true
    },
    
    // NOK - Next of Kin
    nameNOK: {
        type: String,
        // required: true,
        
    },

    addressNOK: {
        type: String,
        // required: true,
    },

    // stateNOK: {
    //     type: stateSchema,
    // },

    phoneNOK: {
        type: String,
        // required: true,
        trim: true
    },

    relationshipNOK: {
        type: String,

    },

    salaryAccountName: {
        type: String,
        // required: true,
        trim: true,     
    },

    salaryAccountNumber: {
        type: String,
        // required: true,
        trim: true
    },

    bankName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank'
    },

    loans: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: "Loan"
    }

}, {
    timestamps: true
});

customerSchema.pre('deleteOne', function(next) {
    Loan.deleteMany( {ippis: this.ippis});
    next();
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;

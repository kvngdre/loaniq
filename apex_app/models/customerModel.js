const mongoose = require('mongoose');
const Bank = require('./bankModel');
const Loan = require('./loanModel');
const State = require('./stateModel');
const Segment = require('./segmentModel');
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
    // TODO: uncomment/add required and unique.
    phone: {
        type: String,
        required: true,
        default: null,
        unique: true,
        trim: true,
    },

    email: {
        type: String,
        lowercase: true,
        unique: true,
        trim: true
    },

    bvn: {
        type: String,
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

    idCardUrl: {
        type: String,
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
        uppercase: true
    },

    // TODO: Set segment depending on ippis
    segment: {
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

    dateOfEnlistment: {
        type: Date,
        // required: true
    },
    
    // NOK - Next of Kin
    // TODO: Finish up on this model
    nameNOK: {
        type: String,
        // required: true,
        
    },

    addressNOK: {
        type: String,
        // required: true,
    },

    stateNOK: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        // required: true
    },

    phoneNOK: {
        type: String,
        // required: true,
        trim: true
    },

    relationshipNOK: {
        type: String,
        enum: [ 'Father',
                'Mother',
                'Brother',
                'Sister',
                'Nephew',
                'Niece',
                'Cousin',
                'Spouse',
                'Son',
                'Daughter'
            ]
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
        ref: 'Loan'
    },

    loanAgent: {
        type: String,
    },

    netPay: {
        type: Number
    }

}, {
    timestamps: true
});

customerSchema.methods.validateSegment = async function() {
    const segments = await Segment.find().select('code');
    const ippisPrefix = this.ippis.slice(0, 2);

    switch(ippisPrefix) {
        case 'PF': 
            this.segment = segments.find(segment => segment.code === "NPF")._id;
            break;

        case 'PR':
            this.segment = segments.find(segment => segment.code === "NCOS")._id;
            break;

        case 'FC':
            this.segment = segments.find(segment => segment.code === "FCTA")._id;
            break;

        case 'NC':
            this.segment = segments.find(segment => segment.code === "NCS")._id;
            break;
    };
}


// before a customer is deleted all loans
customerSchema.pre('remove', async function(next) {
      console.log('test')
    //  const result = await Loan.deleteMany({customer_id: this._id}).exec();
    
    next();
});


customerSchema.pre('remove', function(next) {
    User.loans.updateMany(
        { user_id : this._id}, 
        { $pull: { user_ids: this._id } },
        { multi: true })  //if reference exists in multiple documents 
    .exec();
    next();
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;

const mongoose = require('mongoose');


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
        // default: 'Male'
    },

    dateOfBirth: {
        type: Date,
        required: true,
        validate: {
            // Validate age is over 21
            validator: (dob) => {
                try{
                    const dob_ = new Date(dob);
    
                    // Get the milliseconds between dates.
                    const month_diff = new Date.now() - dob_.getTime();
    
                    // Convert to date format
                    const ageDate = new Date(month_diff);
    
                    // Get age year
                    const ageYear = ageDate.getUTCFullYear();
    
                    const age = ageYear - 1970;
    
                    return age >= 21;

                }catch(exception) {
                    return exception;
                };
            },
            message: "Age cannot be less than 21."
        },
    },

    residentialAddress: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 255,
        trim: true,
        lowercase: true
    },

    stateResident: {
        type: String,
        required: true,
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
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
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
        required: true
    },

    idNumber: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50,
        trim: true
    },

    ippisNo: {
        type: String,
        required: true,
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
        required: true,
        minLength: 6,
        maxLength: 255,
        lowercase: true,
        trim: true
    },

    companyState:{
        type: stateSchema,

    },

    dateOFEnlistment: {
        type: Date,
        required: true
    },
    
    // NOK - Next of Kin
    nameNOK: {
        type: String,
        required: true,
        
    },

    addressNOK: {
        type: String,
        required: true,
    },

    stateNOK: {
        type: stateSchema,
    },

    phoneNOK: {
        type: String,
        required: true,
        trim: true
    },

    relationshipNOK: {
        type: String,

    }, 

    loans: {
        type: [ mongoose.Schema.Types.ObjectId],
        ref: "LoanSchema"
    }


}, {
    timestamps: true
});
const Bank = require('./bankModel');
const mongoose = require('mongoose');
const State = require('./stateModel');
const Segment = require('./segmentModel');
const debug = require('debug')('app:customerModel');


const customerSchema = new mongoose.Schema({
    name: {
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
            minLength: 3,
            maxLength: 50,
            trim:true
        }
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
        street: {
            type: String,
            minLength: 5,
            maxLength: 255,
            trim: true,
            lowercase: true
        },
    
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            required: true
        }
    },

    contact: {
        phone: {
            type: String,
            trim: true,
            required: true
        },
    
        email: {
            type: String,
            lowercase: true,
            trim: true
        }
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
        trim: true,
        required: true
    },
    // TODO: uncomment/add required and unique.
    

    bvn: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },

    idCardInfo: {
        idType: {
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
            minLength: 4,
            maxLength: 50,
            trim: true
        }
    },
    
    employmentInfo: {
        segment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Segment',
            required: true,
        },

        ippis: {
            type: String,
            uppercase: true,
            unique: true
        },
    
        companyLocation: {
            type: String,
            // required: true,
            minLength: 6,
            maxLength: 255,
            lowercase: true,
            trim: true
        },
    
        state:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            // required: true
        },
    
        dateOfEnlistment: {
            type: Date,
            required: true
        }
    },   
    
    nok: {
        name: {
            type: String,
            // required: true,
            
        },
    
        address: {
            street: {
                type: String
            },

            state: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'State',
                // required: true
            },

        },
    
        phone: {
            type: String,
            trim: true
        },
    
        relationship: {
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
    },

    accountInfo: {
        salaryAccountName: {
            type: String,
            trim: true,     
        },
    
        salaryAccountNumber: {
            type: String,
            trim: true
        },
    
        bankName: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bank'
        },
    },

    loanAgent: {
        id: {
            type: String,
        },

        firstName: {
            type: String
        },

        lastName: {
            type: String
        },

        phone: {
            type: String
        }
    },

    netPay: {
        type: Number
    }

}, {
    
    timestamps: true
});

customerSchema.methods.validateSegment = async function() {
    const segments = await Segment.find().select('code');
    const ippisPrefix = this.employmentInfo.ippis.slice(0, 2);

    switch(ippisPrefix) {
        case 'PF': 
            this.employmentInfo.segment = segments.find(segment => segment.code === "NPF")._id;
            break;

        case 'PR':
            this.employmentInfo.segment = segments.find(segment => segment.code === "NCOS")._id;
            break;

        case 'FC':
            this.employmentInfo.segment = segments.find(segment => segment.code === "FCTA")._id;
            break;

        case 'NC':
            this.employmentInfo.segment = segments.find(segment => segment.code === "NCS")._id;
            break;
    };
}

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;

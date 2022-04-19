const Bank = require('./bankModel');
const Loan = require('./loanModel');
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
            trim:true,
            lowercase: true,
            required: true
        },
    
        lastName: {
            type: String,
            minLength: 3,
            maxLength: 50,
            trim:true,
            lowercase: true,
            required: true
        },
    
        middleName: {
            type: String,
            minLength: 3,
            maxLength: 50,
            lowercase: true,
            trim:true
        }
    },
    
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
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
                    const ageDate = new Date( Date.now() - dob_.getTime() );
                    const ageYear = ageDate.getUTCFullYear();
                    const age = ageYear - 1970;

                    return age >= 18;

                }catch(exception) {
                    debug('ageCustomerSchema==', exception.message);
                    return false;
                };
            },
            // TODO: why use UTCFullYear instead of FullYear? 
            message: "Age should be minimum 18."
        },
    },

    residentialAddress: {
        street: {
            type: String,
            minLength: 5,
            maxLength: 255,
            trim: true,
            lowercase: true,
            required: true
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
            trim: true,
            required: true
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
            required: true
        },
    
        idCardUrl: {
            type: String
        },
    
        idNumber: {
            type: String,
            minLength: 4,
            maxLength: 50,
            trim: true,
            required: true
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
            trim: true,
            uppercase: true,
            unique: true,
            required: true
        },
    
        companyLocation: {
            type: String,
            minLength: 6,
            maxLength: 255,
            trim: true,
            lowercase: true,
            required: true
        },
    
        state:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            required: true
        },
    
        dateOfEnlistment: {
            type: Date,
            required: true
        }
    },   
    
    nok: {
        name: {
            type: String,
            trim: true,
            required: true
            
        },
    
        address: {
            street: {
                type: String,
                trim: true,
                lowercase: true,
                required: true
            },

            state: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'State',
                required: true
            },

        },
    
        phone: {
            type: String,
            trim: true,
            required: true
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
                ],
            required: true
        },
    },

    accountInfo: {
        salaryAccountName: {
            type: String,
            trim: true,
            lowercase: true,
            required: true    
        },
    
        salaryAccountNumber: {
            type: String,
            trim: true,
            required: true
        },
    
        bank: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bank',
            required: true
        },
    },

    netPay: {
        type: Number
        // TODO: read from origin collection.
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
        default:
            
    };
}


customerSchema.pre('save', async function (next) {
    const loanEditTrigger = ['dateOfBirth', 'employmentInfo.dateOfEnlistment'];
  
    if(this.modifiedPaths().some( path => loanEditTrigger.includes(path) )){
        console.log('triggered')

        const loans = await Loan.find( { customer: this._id, status: 'pending' } )
        loans.forEach( async loan => {
            loan.set({'validationParams.dob': this.dateOfBirth})
            await loan.save();
        });
    };

    // capitalize names
    // TODO: can front end handle this. 
    // this.name.firstName = this.name.firstName.charAt(0).toUpperCase() + this.name.firstName.slice(1).toLowerCase();
    // this.name.lastName = this.name.lastName.charAt(0).toUpperCase() + this.name.lastName.slice(1).toLowerCase();
    // if(this.name.middleName) this.name.middleName = this.name.middleName.charAt(0).toUpperCase() + this.name.middleName.slice(1).toLowerCase();
    
    next();
  });

// customerSchema.post(/.+Update$/, function() {
//     console.log('I was called.')
//     // const chan = this.getChanges();
//     // console.log('ijh', this.getChanges().$set);
//     // console.log(Object.keys(chan));

//     console.log('I was called.')
//     // const modifiedFields = this.getUpdate().$set;
//     console.log(this.modifiedPaths());
// });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;

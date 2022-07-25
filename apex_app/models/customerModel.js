const Bank = require('./bankModel');
const Loan = require('./loanModel');
const mongoose = require('mongoose');
const State = require('./stateModel');
const Segment = require('./segmentModel');
const debug = require('debug')('app:customerModel');


const customerSchema = new mongoose.Schema({
    passport: {
        path: {
            type: String
        },

        originalName: {
            type: String
        }
    },  

    name: {
        firstName: {
            type: String,
            minLength: 3,
            maxLength: 50,
            trim:true,
            required: true
        },
    
        lastName: {
            type: String,
            minLength: 3,
            maxLength: 50,
            trim:true,
            required: true
        },
    
        middleName: {
            type: String,
            minLength: 3,
            maxLength: 50,
            trim:true
        }
    },

    displayName: {
        type: String,
        default: function() {
            return this.name.firstName.concat(this.name.middleName ? ` ${this.name.middleName}` : '', ` ${this.name.lastName}`);
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
            unique: true,
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

    idCard: {
        path: {
            type: String
        },

        originalName: {
            type: String
        }
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
            enum: [ 
                'Brother',
                'Cousin',
                'Daughter',
                'Father',
                'Mother',
                'Nephew',
                'Niece',
                'Sister',
                'Son',
                'Spouse',
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

    // below are set programmatically. No user can edit.
    netPay: {
        value:{
            type: Number
        },

        updatedAt: {
            type: Date,
            default: new Date()
        }
        // TODO: read from origin collection.
    },

    bvnValid: {
        type: Boolean,
        default: false
    }   

}, {
    timestamps: true
});

customerSchema.methods.validateSegment = async function() {
    const segments = await Segment.find().select('ippisPrefix');

    let foundMatch = this.employmentInfo.ippis.match(/[A-Z]{2,3}/)
    !foundMatch ? foundMatch = '' : foundMatch = foundMatch[0]

    const segmentObj = segments.find(segment => segment.ippisPrefix === foundMatch);

    this.employmentInfo.segment = segmentObj._id.toString()  
}


customerSchema.pre('save', async function (next) {
    const loanEditTrigger = ['dateOfBirth', 'employmentInfo.dateOfEnlistment'];
  
    if(this.modifiedPaths().some( path => loanEditTrigger.includes(path) )){
        console.log('triggered');

        const loans = await Loan.find( { customer: this._id, status: 'pending' } );
        loans.forEach( async loan => {
            loan.set({'validationParams.dob': this.dateOfBirth})
            loan.set({'validationParams.doe': this.employmentInfo.dateOfEnlistment})
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

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
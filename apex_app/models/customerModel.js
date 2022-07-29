const moment = require('moment')
const Loan = require('./loanModel')
const mongoose = require('mongoose')
const Segment = require('./segmentModel')
const debug = require('debug')('app:customerModel')


const schemaOptions = {timestamps: true}

const addressSchema = {
    street: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },

    state: {
        type: String,
        required: true
    },

    stateCode: {
        type: String,
        uppercase: true,
        required: true
    },

    lga: {
        type: String,
        required: true
    },

    geo: {
        type: String,
        required: true
    }
};

const customerSchema = new mongoose.Schema({
    passport: {
        path: {
            type: String,
            default: null
        },

        originalName: {
            type: String,
            default: null
        }
    },  

    name: {
        first: {
            type: String,
            minLength: 3,
            maxLength: 50,
            trim:true,
            required: true
        },
    
        last: {
            type: String,
            minLength: 3,
            maxLength: 50,
            trim:true,
            required: true
        },
    
        middle: {
            type: String,
            minLength: 3,
            maxLength: 50,
            trim:true
        }
    },

    displayName: {
        type: String,
        default: function() {
            return this.name.first.concat(this.name.middle ? ` ${this.name.middle}` : '', ` ${this.name.last}`);
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
            validator: (dob) => {
                try{
                    dob = (new Date(dob)).toISOString().substring(0, 10)
                    console.log(dob)
                    minDateOfBirth = moment().subtract(21, 'years').format('YYYY-MM-DD')
                    console.log(dob.substring(0, 10), minDateOfBirth)
                    return dob <= minDateOfBirth;

                }catch(exception) {
                    debug('ageCustomerSchema==', exception.message);
                    return false;
                };
            },
            message: "Age should be minimum 21."
        },
    },

    residentialAddress: addressSchema,

    contactInfo: {
        phone: {
            type: String,
            trim: true,
            required: true
        },
    
        email: {
            type: String,
            lowercase: true,
            trim: true,
            default: null
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
            type: String,
            default: null
        },

        originalName: {
            type: String,
            default: null
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
    
        idNumber: {
            type: String,
            minLength: 4,
            maxLength: 50,
            trim: true,
            required: true,
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
            unique: true,
            trim: true,
            required: true,
            validate: {
                validator: function(ippisNo) {
                    try{
                        console.log('======', this)
                        const segment = Segment.findById(this.employmentInfo.segment)
                        if(!segment) throw new Error('Segment not found')

                        const ippisPrefix = ippisNo.match(/^[A-Z]{2,3}(?=[0-9])/)
                        if(segment.ippisPrefix !== ippisPrefix) return false;

                        return true;

                    }catch(exception) {
                        debug('ippis mongodb validator error=>', exception)
                    }
                },
                message: '>>IPPIS Number does not match segment selected'
            }
            
        },
    
        companyLocation: addressSchema,
    
        dateOfEnlistment: {
            type: Date,
            required: true
        }
    },   
    
    nok: {
        fullName: {
            type: String,
            trim: true,
            required: true
            
        },
    
        address: addressSchema,
    
        phone: {
            type: String,
            trim: true,
            required: true
        },
    
        relationship: {
            type: String,
            enum: [ 
                'Daughter',
                'Brother',
                'Cousin',
                'Father',
                'Mother',
                'Nephew',
                'Sister',
                'Spouse',
                'Niece',
                'Son',
                ],
            required: true
        },
    },

    accountInfo: {
        salaryAccountName: {
            type: String,
            lowercase: true,
            required: true,
            trim: true,
        },
    
        salaryAccountNumber: {
            type: String,
            trim: true,
            required: true
        },
    
        bank: {
            name: {
                type: String,
                required: true
            },

            code: {
                type: String,
                maxLength: 6,
                required: true
            }
        },
    },

    // below are set programmatically. No user can edit.
    netPay: {
        value:{
            type: Number,
            default: null
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

}, schemaOptions);

customerSchema.methods.validateSegment = async function() {
    const segments = await Segment.find().select('ippisPrefix');

    let foundMatch = this.employmentInfo.ippis.match(/[A-Z]{2,3}/)
    !foundMatch ? foundMatch = '' : foundMatch = foundMatch[0]

    const segmentObj = segments.find(segment => segment.ippisPrefix === foundMatch);

    this.employmentInfo.segment = segmentObj._id.toString()  
};


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

    next();

  });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
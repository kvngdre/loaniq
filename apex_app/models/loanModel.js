const mongoose = require('mongoose');
const User = require('../models/userModel');
const Lender = require('../models/lenderModel');
const Metrics = require('../tools/Managers/loanMetricsEval');


const loanMetricFuncs = new Metrics();

const schemaOptions = {timestamps: true}

const loanSchema = new mongoose.Schema({  
    netPay: {
        type: Number,
        required: true
    },  
    
    amount: {
        type: Number,
        required: true,
    },
   
    amountInWords: {
        type: String,
        trim: true
    },

    tenor: {
        type: Number,
        required: true
    },

    loanType: {
        type: String,
        enum: [
            'New',
            'Top Up'
        ],
        default:'New'
    },
    // End of the line where loan agent user can edit.

    recommendedAmount: {
        type: Number,
        default: (self=this) => self.amount
    },
    
    recommendedTenor: {
        type: Number,
        default: (self=this) => self.tenor
    },
    
    status: {
        type: String,
        enum: [
            'Approved',
            'Denied',
            'Pending',
            'On Hold',
            'Liquidated',
            'Discontinued',
            'Completed'
        ],
        default: 'Pending'
    },

    comment: {
        type: String
    },
    // End of the line where credit user can edit.

    loanAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    interestRate: {
        type: Number,
        required: true
    },
    
    upfrontFeePercentage: {
        type: Number,
        require: true
    },
    
    transferFee: {
        type: Number,
        required: true
    },
    // End of the line where admin user can edit
    
    // Below are set programmatically, no user can edit.
    upfrontFee: {
        type: Number
    }, 

    repayment: {
        type: Number,
    },
    
    totalRepayment: {
        type: Number
    },
    
    netValue: {
        type: Number,
        default: null
    },

    metrics: {
        ageValid: {
            isValid: {
                type: Boolean,
                default: null
            },
            
            age: {
                type: Number,
                default: null
            }
        },
        
        serviceLengthValid: {
            isValid: {
                type: Boolean,
                default: null
            },
            
            yearsServed: {
                type: Number,
                default: null
            }
        },

        netPayValid: {
            type: Boolean,
            default: null
        },
        
        // TODO: should this be moved to the customer model?
        netPayConsistency: {
            type: Boolean,
            default: null
        },
                
        debtToIncomeRatio: {
            isValid: {
                type: Boolean,
                default: null
            },

            value: {
                type: Number,
                default: null
            }
        }
    },

    // TODO: remember to correct mongodb time
    dateAppOrDec: {
        type: Date
    },

    expectedEndDate: {
        type: String
    },

    customer: {
        type: mongoose.Schema.Types.ObjectId,
    },

    creditOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    lenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lender'
    },
    
    active: {
        type: Boolean,
        default: false
    },

    booked: {
        type: Boolean,
        default: false
    },

    disbursed: {
        type: Boolean,
        default: false
    },        

    validationParams: {
        dob: {
            type: Date,
            default: null
        },

        doe: {
            type: Date,
            default: null
        },

        minNetPay: {
            type: Number,
            default: null
        },

        dtiThreshold: {
            type: Number,
            default: null
        }
    }
     
}, schemaOptions);


loanSchema.pre('save', function(next) {
    if(this.modifiedPaths().some( path => ['amount', 'tenor'].includes(path) )) {
        this.recommendedAmount = this.amount
        this.recommendedTenor = this.tenor
    };

    const loanMetricsTriggers = ['recommendedAmount', 'recommendedTenor'];

    // setting loan metrics
    if(this.modifiedPaths().some( path => loanMetricsTriggers.includes(path) )) {
        console.log('yes')
        this.upfrontFee = loanMetricFuncs.calcUpfrontFee(this.recommendedAmount, this.upfrontFeePercentage);
        this.repayment = loanMetricFuncs.calcRepayment(this.recommendedAmount, this.interestRate, this.recommendedTenor);
        this.totalRepayment = loanMetricFuncs.calcTotalRepayment(this.repayment, this.recommendedTenor);
        this.netValue = loanMetricFuncs.calcNetValue(this.recommendedAmount, this.upfrontFee, this.transferFee); 
    };


    const validationMetricTrigger = ['validationParams'];

    // setting validation metics
    if(this.modifiedPaths().some( path => validationMetricTrigger.includes(path) )) {
        console.log('I dey here')
        this.metrics.ageValid = loanMetricFuncs.ageValidator(this.validationParams.dob);
        this.metrics.serviceLengthValid = loanMetricFuncs.serviceLengthValidator(this.validationParams.doe);
        this.metrics.netPayValid = loanMetricFuncs.netPayValidator(this.netPay, this.validationParams.minNetPay);
        this.metrics.debtToIncomeRatio = loanMetricFuncs.dtiRatioCalculator(this.repayment, this.netPay, this.validationParams.dtiThreshold);

    };

    if(this.status === 'approved' && this.active === false) {
        this.active = true;

        const oneMonth = 2628000000;
        const tenorMilliseconds = oneMonth * (this.recommendedTenor - 1);
        const endDate = new Date(this.dateAppOrDec.getTime() + tenorMilliseconds).toISOString().split('T');
        this.expectedEndDate = endDate;
    };

    next();
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;
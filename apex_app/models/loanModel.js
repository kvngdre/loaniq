const mongoose = require('mongoose');
const Bank = require('../models/bankModel');
const User = require('../models/userModel');
const Lender = require('../models/lenderModel');
const Metrics = require('../tools/Managers/loanMetricsEval');


const metrics = new Metrics();

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
            'new',
            'topUp'
        ],
        default:'new'
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
            'approved',
            'denied',
            'pending',
            'onHold',
            'liquidated',
            'discontinued',
            'completed'
        ],
        default: 'pending'
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
        type: Number
    },

    metrics: {
        ageValid: {
            result: {
                type: Boolean
            },
            
            value: {
                type: Number
            }
        },
        
        serviceLengthValid: {
            result: {
                type: Boolean
            },
            
            value: {
                type: Number
            }
        },
        // TODO: should the net pay include the value
        netPayValid: {
            result: {
                type: Boolean
            }
        },
        
        netPayConsistency: {
            type: Boolean
        },
                
        salaryAccountValid: {
            type: Boolean
        },
        
        debtToIncomeRatio: {
            result: {
                type: Boolean
            },

            value: {
                type: Number
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

    active: {
        type: Boolean,
        default: false
    },

    booked: {
        customer: {
            type: Boolean,
            default: false
        },

        loan: {
            type: Boolean,
            default: false
        }
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

    validationParams: {
        dob: {
            type: Date
        },

        doe: {
            type: Date
        },

        minNetPay: {
            type: Number
        },

        dtiThreshold: {
            type: Number
        }
    }
     
}, {
    timestamps: true
});


loanSchema.pre('save', function(next) {
    if(this.modifiedPaths().some( path => ['amount', 'tenor'].includes(path) )) {
        this.recommendedAmount = this.amount;
        this.recommendedTenor = this.tenor
    };

    const loanMetricsTriggers = ['recommendedAmount', 'recommendedTenor'];

    // setting loan metrics
    if(this.modifiedPaths().some( path => loanMetricsTriggers.includes(path) )) {
        console.log('yes')
        this.upfrontFee = metrics.calcUpfrontFee(this.recommendedAmount, this.upfrontFeePercentage);
        this.repayment = metrics.calcRepayment(this.recommendedAmount, this.interestRate, this.recommendedTenor);
        this.totalRepayment = metrics.calcTotalRepayment(this.repayment, this.recommendedTenor);
        this.netValue = metrics.calcNetValue(this.recommendedAmount, this.upfrontFee, this.transferFee); 
    };


    const validationMetricTrigger = ['validationParams'];

    // setting validation metics
    if(this.modifiedPaths().some( path => validationMetricTrigger.includes(path) )) {
        console.log('I dey here');
        this.metrics.ageValid = metrics.ageValidator(this.validationParams.dob);
        this.metrics.serviceLengthValid = metrics.serviceLengthValidator(this.validationParams.doe);
        this.metrics.netPayValid = metrics.netPayValidator(this.netPay, this.validationParams.minNetPay);
        this.metrics.debtToIncomeRatio = metrics.dtiRatioCalculator(this.repayment, this.netPay, this.validationParams.dtiThreshold);

    };

    if(this.status === 'approved' && this.active === false) {
        this.active = true;

        const oneMonth = 2628000000;
        const tenorMilliseconds = oneMonth * (this.recommendedTenor - 1);
        const endDate = new Date(this.dateAppOrDec.getTime() + tenorMilliseconds).toISOString().split('T');
        console.log(endDate)
        this.expectedEndDate = endDate;
    };

    next();
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;
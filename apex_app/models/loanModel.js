const config = require('config');
const mongoose = require('mongoose');
const Customer = require('./customerModel');
const User = require('../models/userModel');



const loanSchema = new mongoose.Schema({  
    netPay: {
        type: Number,
        required: true
        // Should read netPay from another db
    },  
    
    amount: {
        type: Number,
        required: true,
        min: config.get('loanMetrics.minLoanAmount')
    },
   
    amountInWords: {
        type: String,
        trim: true
    },

    tenor: {
        type: Number,
        required: true,
        min: config.get('loanMetrics.minTenor'),
        max: config.get('loanMetrics.maxTenor')
    },

    loanType: {
        // Look to automate this.
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
            'declined',
            'pending',
            'onHold',
            'liquidated',
            'discontinued',
            'completed'
        ],
        default: 'pending'
    },
    // End of the line where credit user can edit.

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },

    loanAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    interestRate: {
        type: Number,
        default: () =>  config.get('loanMetrics.interestRate')
    },
    
    upfrontFeePercentage: {
        type: Number,
        default: () => config.get('loanMetrics.upfrontFeePercentage')
    },
    
    transferFee: {
        type: Number,
        default: config.get('loanMetrics.transferFee')
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
        
        bvnValid: {
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

    creditOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    dateAppOrDec: {
        type: Date
    },

    expectedEndDate: {
        type: Date
    },

    active: {
        type: Boolean,
        default: false
    }
     
}, {
    timestamps: true
});


loanSchema.pre('save', function(next) {
    if(this.status === 'approved') {
        this.active = true;

        const oneMonth = 2628000000;  // in milliseconds
        const tenorMilliseconds = oneMonth * this.recommendedTenor - 1;
        
        const endDate = new Date(this.dateAppOrDec.getTime() + tenorMilliseconds);
        const day = endDate.getDate().toString().padStart(2, '0');
        const month = (endDate.getMonth() + 1).toString().padStart(2, '0');
        const year = endDate.getFullYear();
        
        this.expectedEndDate = `${year}-${month}-${day}`;
    }

    next();
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;

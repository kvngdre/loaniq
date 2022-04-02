const config = require('config');
const mongoose = require('mongoose');
const Customer = require('./customerModel');
const User = require('../models/userModel');
const Metrics = require('../tools/Managers/loanMetricsEval')


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
            'exceptionalApproval'
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

    fee: {
        type: Number,
        default: config.get('loanMetrics.fee')
    },
    // End of the line where admin user can edit

    // Below are set programmatically, no user can edit.
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
        
        netPayValid: {
            result: {
                type: Boolean
            },
            
            value: {
                type: Number
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
            type: Number
        }
        
    },

    creditOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    dateAppOrDec: {
        type: Date,
        default: (self=this) => {
            if(['approved', 'declined'].includes(this.status)) {
                this.dateAppOrDec = Date.now();
            }
        }
    },

    
      
}, {
    timestamps: true
});

// loanSchema.pre('save', function(next) {
//     this.fee = config.get('loanMetrics.fee');

//     next();
// });

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;

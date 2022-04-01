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
        min: config.get('minLoanAmount')
    },
   
    amountInWords: {
        type: String,
        trim: true
    },

    tenor: {
        type: Number,
        required: true,
        min: config.get('minTenor'),
        max: config.get('maxTenor')
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
        default: () =>  config.get('interestRate')
    },
    
    upfrontFeePercentage: {
        type: Number,
        default: () => config.get('upfrontFeePercentage')
    },

    fee: {
        type: Number,
        default: config.get('fee')
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
            type: Boolean
        },
        
        serviceLengthValid: {
            type: Boolean
        },
        
        netPayValid: {
            type: Boolean
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

// loanSchema.post
loanSchema.pre('save', function(next) {
    this.fee = config.get('fee');

    next();
})

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;

const config = require('config');
const mongoose = require('mongoose');
const Customer = require('./customerModel');
const User = require('../models/userModel');


const loanSchema = new mongoose.Schema({  
    customer: {
        type: String
    },
    
    loanAgent: {
        type: String
    },

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
    
    // TODO: uncomment required.
    tenor: {
        type: Number,
        required: true,
        min: config.get('minTenor'),
        max: config.get('maxTenor')
    },
    
    recommendedTenor: {
        type: Number,
        default: (self=this) => self.tenor
    },
    
    loanType: {
        type: String,
        enum: [
            'New',
            'Top Up'
        ],
    },

    interestRate: {
        type: Number
    },
    
    upfrontPercentage: {
        type: Number
    },

    fee: {
        type: Number,
        default: config.get('fee')
    },

    // TODO: figure out how to update this with every change to status.
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
    
    status: {
        type: String,
        enum: [
            'Approved',
            'Declined',
            'Pending',
            'On Hold',
            'Liquidated',
            'Discontinued',
            'Exceptional Approval'
        ],
        default: 'Pending'
    },

    dateAppOrDec: {
        type: Date
    }
    
}, {
    timestamps: true
});

loanSchema.pre('save', function(next) {
    this.fee = config.get('fee');

    next();
})

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;

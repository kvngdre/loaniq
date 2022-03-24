const config = require('config');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Customer = require('../models/customerModel');


const loanSchema = new mongoose.Schema({
    ippis: {
        type: String,
        uppercase: true,
        required: true,
    },

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
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
        //  required: true,
        trim: true
    },

    // TODO: uncomment required.
    tenor: {
        type: Number,
        // required: true,
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
            'new',
            'TopUp'
        ],
        default: "new"
    },

    interestRate: {
        type: Number
    },

    upfrontPercentage: {
        type: Number
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

    // TODO: figure out how to update this with every change to status.
    dateAppOrDec: {
        type: Date
    },
    
    loanAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
            type: Boolean
        }

    }
  
}, {
    timestamps: true
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;

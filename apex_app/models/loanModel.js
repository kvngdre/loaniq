const config = require('config');
const mongoose = require('mongoose');
const User = require('../models/userModel');


const loanSchema = new mongoose.Schema({
    ippis: {
        type: String,
        uppercase: true,
        required: true,
    },

    netPay: {
        type: Number,
        required: true
        // Should read netPay from another db
    },

    amount: {
        type: Number,
        required: true,
        min: 50_000
    },

    amountInWords: {
        type: String,
        //  required: true,
        trim: true
    },

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
            'new',
            'TopUp'
        ],
        default: "new"
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
    dateAppORDec: {
        type: Date
    },
    
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
  
}, {
    timestamps: true
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;

const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    ippis: {
        type: String,
        required: true,
        default: ""
        // TODO: How do get access to the ippis in the customer.
    },

    netPay: {
         type: Number,
         required: true
        // Should read netPay from our db
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
         min: 3,
         max: 18
    },

    recommendedTenor: {
         type: Number,
         default: function() { return this.tenor; }
    },
    // TODO: how this is assigned??
    loanType: {
        type: String,
        enum: [
            'new',
            'TopUp'
        ],
        default: "new"
    }

    
}, {
    timestamps: true
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;
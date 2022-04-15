const loanManager = require('../tools/Managers/loanManager');
const Loan = require('../models/loanModel');


const loans = {
    createLoanRequest: async function(loanMetricsObj, request) {
        return await loanManager.createLoanRequest(loanMetricsObj, request);
    },

    createLoan: async function(customer, loanMetricsObj, request) {
        return await loanManager.createLoan(customer, loanMetricsObj, request);
    },

    getAll: async function(user) {
        return await loanManager.getAll(user);
    },

    getOne: async function(id, user) {
        return await loanManager.getOne(id, user)
    },

    edit: async function(request) {
        return await loanManager.edit(request);
    },

    getDisbursement: async function(user, dateTime) {
        return await loanManager.getDisbursement(user, { status: 'approved', active: true, createdAt: { $gte: new Date(dateTime) } } );
    }
    
};

module.exports = loans;

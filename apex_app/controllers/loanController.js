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
    },

    getLoanBooking: async function(request) {
        request.body.active = true;
        request.body.booked = false;
        request.body.status = "approved";
        request.body.lenderId = request.user.lenderId;
        request.body.createdAt = {$gte: new Date(request.body.fromDate)};
        
        return await loanManager.getLoanBooking(request.body);

    },

    expiring: async function() {
        return await loanManager.closeExpiringLoans();
    }
    
};

module.exports = loans;

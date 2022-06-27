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

    getDisbursement: async function(user, startDateTime, endDateTime="2050-01-01") {
        return await loanManager.getDisbursement(user, 
            {
                active: true,
                disbursed: false,
                status: "Approved",
                lenderId: user.lenderId,
                createdAt: { $gte: new Date(startDateTime).toISOString(), $lt: new Date(endDateTime).toISOString() } 
            } );
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

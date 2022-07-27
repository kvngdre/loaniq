const _ = require('lodash');
const loanManager = require('../tools/Managers/loanManager');


const loans = {
    createLoanRequest: async function(loanMetricsObj, request) {
        if(request.user.role === 'guest') request.user.lenderId = request.params.id;

        return await loanManager.createLoanRequest(loanMetricsObj, request);
    },

    createLoan: async function(customer, loanMetricsObj, request) {
        return await loanManager.createLoan(customer, loanMetricsObj, request);
    },

    getAll: async function(user, requestBody) {
        let queryParams = { lenderId: user.lenderId };

        if(user.role === 'Loan Agent') {
            queryParams.loanAgent = user.id;
            return await loanManager.getAll(user, queryParams);
        };

        queryParams = Object.assign(queryParams, _.omit(requestBody, ['start', 'end', 'loanAmount', 'tenor']))
        if(requestBody.tenor) queryParams.recommendedTenor = { $gte: requestBody.tenor }
        
        if(requestBody.loanAmount) queryParams.recommendedAmount = { $gte: requestBody.loanAmount }
        
        if(requestBody.start) queryParams.createdAt = { $gte: requestBody.start, $lt: (requestBody.end ? requestBody.end : "2122-01-01") }

        return await loanManager.getAll(user, queryParams);
    },

    getOne: async function(user, id) {
        const queryParams = { _id: id, lenderId: user.lenderId };
        
        if(user.role === 'Loan Agent') {
            queryParams.loanAgent = user.id
            return await loanManager.getOne(queryParams);
        }

        return await loanManager.getOne(queryParams);
    },

    edit: async function(user, id, requestBody) {
        return await loanManager.edit(user, id, requestBody);
    },

    getDisbursement: async function(user, requestBody) {
        // TODO: handle end date on the controller function
        let queryParams = { lenderId: user.lenderId, active: true, disbursed: false, status: 'Approved' };

        queryParams = Object.assign(queryParams, _.omit(requestBody, ['start', 'end']))
        if(requestBody.start) queryParams.createdAt = { $gte: requestBody.start, $lt: (requestBody.end ? requestBody.end : "2122-01-01") }
        
        return await loanManager.getDisbursement(user, queryParams);
    },

    getLoanBooking: async function(request) {
        request.body.active = true;
        request.body.booked = false;
        request.body.status = "Approved";
        request.body.lenderId = request.user.lenderId;
        request.body.createdAt = {$gte: new Date(request.body.fromDate)};
        
        return await loanManager.getLoanBooking(request.body);

    },

    expiring: async function() {
        return await loanManager.closeExpiringLoans();
    }
    
};

module.exports = loans;

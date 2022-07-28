const _ = require('lodash');
const moment = require('moment-timezone')
const loanManager = require('../tools/Managers/loanManager');


const loans = {
    createLoanRequest: async function(loanMetricsObj, request) {
        // if(request.user.role === 'guest') request.user.lenderId = request.params.id;

        return await loanManager.createLoanRequest(loanMetricsObj, request);
    },

    createLoan: async function(customer, loanMetricsObj, request) {
        return await loanManager.createLoan(customer, loanMetricsObj, request);
    },

    getAll: async function(user, filters) {
        let queryParams = { lenderId: user.lenderId };
        if(user.role === 'Loan Agent') {
            queryParams.loanAgent = user.id;
            return await loanManager.getAll(user, queryParams);
        };

        queryParams = Object.assign(queryParams, _.omit(filters, ['date', 'amount', 'tenor']))
        if(filters.date?.start) queryParams.createdAt = { $gte: filters.date.start};
        if(filters.date?.end) {
            const target = queryParams.createdAt ? queryParams.createdAt : {}
            queryParams.createdAt = Object.assign(target , {$lte: moment.tz(filters.date.end, 'Africa/Lagos').tz('UTC').format()})
        };

        if(filters.amount?.start) queryParams.recommendedAmount = { $gte: filters.amount.start};
        if(filters.amount?.end) {
            const target = queryParams.recommendedAmount ? queryParams.recommendedAmount : {}
            queryParams.recommendedAmount = Object.assign(target , {$lte: filters.amount.end,})
        };

        if(filters.tenor?.start) queryParams.recommendedTenor = { $gte: filters.tenor.start};
        if(filters.tenor?.end) {
            const target = queryParams.recommendedTenor ? queryParams.recommendedTenor : {}
            queryParams.recommendedTenor = Object.assign(target , { $lte: filters.tenor.end })
        };

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

const _ = require('lodash');
const moment = require('moment-timezone');
const loanManager = require('../tools/Managers/loanManager');
const adjustToUserTimeZone = require('../utils/adjustToTimeZone');


const loans = {
    createLoanRequest: async function(loanMetricsObj, request) {
        // if(request.user.role === 'guest') request.user.lenderId = request.params.id;

        const newLoanRequest =  await loanManager.createLoanRequest(loanMetricsObj, request)
        if(newLoanRequest instanceof Error) return newLoanRequest;

        // return newLoanRequest;

        return adjustToUserTimeZone(request.user.timeZone, newLoanRequest);
    },

    createLoan: async function(customer, loanMetricsObj, request) {
        const newLoan = await loanManager.createLoan(customer, loanMetricsObj, request);
        if(newLoan instanceof Error) return newLoan;

        return adjustToUserTimeZone(request.user.timeZone, newLoan);
    },

    getAll: async function(user, filters) {
        let loans = []
        let queryParams = { lenderId: user.lenderId };

        if(user.role === 'Loan Agent') {           
            queryParams.loanAgent = user.id;
            loans =  await loanManager.getAll(queryParams);
        }else{
            queryParams = Object.assign(queryParams, _.omit(filters, ['date', 'amount', 'tenor']))
            
            if(filters.date?.start) queryParams.createdAt = { $gte: filters.date.start };
            if(filters.date?.end) {
                const target = queryParams.createdAt ? queryParams.createdAt : {}
                queryParams.createdAt = Object.assign(target , {$lte: moment.tz(filters.date.end, 'Africa/Lagos').tz('UTC').format()})
            };
    
            if(filters.amount?.min) queryParams.recommendedAmount = { $gte: filters.amount.min};
            if(filters.amount?.max) {
                const target = queryParams.recommendedAmount ? queryParams.recommendedAmount : {}
                queryParams.recommendedAmount = Object.assign(target , {$lte: filters.amount.max,})
            };
    
            if(filters.tenor?.min) queryParams.recommendedTenor = { $gte: filters.tenor.min};
            if(filters.tenor?.max) {
                const target = queryParams.recommendedTenor ? queryParams.recommendedTenor : {}
                queryParams.recommendedTenor = Object.assign(target , { $lte: filters.tenor.max })
            };
    
            loans = await loanManager.getAll(queryParams)
        };

        if(loans instanceof Error) return loans;

        return adjustToUserTimeZone(user.timeZone, loans);
    },

    getOne: async function(user, docId) {
        let loan = null
        const queryParams = { _id: docId, lenderId: user.lenderId };
        
        if(user.role === 'Loan Agent') {
            queryParams.loanAgent = user.id
            loan = await loanManager.getOne(queryParams)

        }else loan =  await loanManager.getOne(queryParams);

        if(loan instanceof Error) return loan;

        // return loan;

        return  adjustToUserTimeZone(user.timeZone, loan);
    },

    edit: async function(user, id, alteration) {
        return await loanManager.edit(user, id, alteration);
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

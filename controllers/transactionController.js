const _ = require('lodash')
const moment = require('moment-timezone')
const debug = require('debug')('app:txnCtrl')
const Transaction = require('../models/transactionModel')

const transactionCtrlFuncs = {
    create: async function(requestBody) {
        try{
            const newTransaction = await Transaction.create(requestBody);
            return newTransaction;

        }catch(exception) {
            debug(exception);
            return exception;
        }
    },

    getOne: async function(id, user) {
        try{
            const queryParams = {lenderId: user.lenderId, _id: id};

            const transaction = await Transaction.findOne( queryParams )
            if(!transaction) throw new Error('Transaction not found');

            return transaction;

        }catch(exception) {
            debug(exception)
            return exception;
        }
    },

    getAll: async function(user, filters) {
        try{
            let queryParams = { lenderId: user.lenderId };

            queryParams = Object.assign(queryParams, _.omit(filters, ['start', 'end']))
            console.log(moment.tz(filters.start, user.timeZone).tz('UTC').format())
            if(filters.start) queryParams.createdAt = { $gte: moment.tz(filters.start, user.timeZone).tz('UTC').format() };
            if(filters.end) queryParams.createdAt['$lte'] = moment.tz(filters.end, user.timeZone).tz('UTC').format();

            const transactions = await Transaction.find( queryParams );
            if(transactions.length === 0) throw new Error('No transactions found');

            return transactions;

        }catch(exception) {
            debug(exception)
            return exception;
        };
    }
}

module.exports = transactionCtrlFuncs;
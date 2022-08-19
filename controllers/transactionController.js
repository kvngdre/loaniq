const _ = require('lodash');
const { DateTime } = require('luxon');
const debug = require('debug')('app:txnCtrl');
const Transaction = require('../models/transactionModel');

const transactionCtrlFuncs = {
    create: async function (
        lenderId,
        userId,
        status,
        ref,
        type,
        desc,
        channel,
        bank,
        amount,
        fees,
        balance
    ) {
        try {
            const newTransaction = new Transaction({
                lenderId,
                userId,
                status,
                reference: ref,
                type,
                description: desc,
                channel,
                bank,
                amount,
                fees,
                balance,
            });

            await newTransaction.save();

            return {
                message: 'Transaction created',
                data: newTransaction,
            };
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    getOne: async function (id, user) {
        try {
            const queryParams = { _id: id, lenderId: user.lenderId };

            const transaction = await Transaction.findOne(queryParams);
            if (!transaction)
                return { errorCode: 404, message: 'Transaction not found' };

            return transaction;
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    getAll: async function (user, filters) {
        try {
            let queryParams = { lenderId: user.lenderId };

            queryParams = Object.assign(
                queryParams,
                _.omit(filters, ['start', 'end'])
            );

            if (filters.start)
                queryParams.createdAt = {
                    $gte: DateTime.fromISO(filters.start)
                        .setZone(user.timeZone)
                        .toUTC()
                        .toString(),
                };

            if (filters.end)
                queryParams.createdAt['$lte'] = DateTime.fromISO(filters.end)
                    .setZone(user.timeZone)
                    .toUTC()
                    .toString();

            const transactions = await Transaction.find(queryParams);
            if (transactions.length == 0)
                return { errorCode: 404, message: 'No transactions found' };

            return transactions;
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },
};

module.exports = transactionCtrlFuncs;

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
                _.omit(filters, ['date', 'end'])
            );
            
            // TODO: should I make the filters a class?
            // Date Filter - CreatedAt
            const dateField = 'createdAt';
            if (filters.date?.start)
                queryParams[dateField] = {
                    $gte: DateTime.fromISO(filters.date.start)
                        .setZone(user.timeZone)
                        .toUTC()
                };
            if (filters.date?.end) {
                const target = queryParams[dateField]
                    ? queryParams[dateField]
                    : {};
                queryParams[dateField] = Object.assign(target, {
                    $lte: DateTime.fromISO(filters.date.end)
                        .setZone(user.timeZone)
                        .toUTC()
                });
            }
            
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

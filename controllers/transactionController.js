const { roles } = require('../utils/constants');
const debug = require('debug')('app:txnCtrl');
const logger = require('../utils/logger')('txnCtrl.js');
const ServerError = require('../errors/serverError');
const Transaction = require('../models/transactionModel');

module.exports = {
    create: async (user, payload) => {
        try {
            const newTransaction = new Transaction(payload);
            newTransaction.modifiedBy = user.id;

            await newTransaction.save();

            return {
                message: 'Transaction created.',
                data: newTransaction,
            };
        } catch (exception) {
            logger.error({
                method: 'create',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    getAll: async (user, filters) => {
        try {
            const queryParams =
                user.role === roles.master ? {} : { lender: user.lender };

            if (filters?.type) queryParams.type = filters.type;
            if (filters?.status) queryParams.status = filters.status;

            // Number Filter - amount   `k            if (filters?.min) queryParams.amount = { $gte: filters.min };
            if (filters?.max) {
                const target = queryParams.amount ? queryParams.amount : {};
                queryParams.amount = Object.assign(target, {
                    $lte: filters.max,
                });
            }

            const foundTransactions = await Transaction.find(queryParams, {
                lender: 0,
            }).sort('-createdAt');
            if (foundTransactions.length == 0)
                return new ServerError(404, 'No transactions found');

            return {
                message: 'success',
                data: foundTransactions,
            };
        } catch (exception) {
            logger.error({
                method: 'get_all',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    getOne: async (id, user) => {
        try {
            const foundTransaction = await Transaction.findById(id, {
                lender: 0,
            });
            if (!foundTransaction)
                return new ServerError(404, 'Transaction not found');

            return {
                message: 'success',
                data: foundTransaction,
            };
        } catch (exception) {
            logger.error({
                method: 'get_one',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    update: async (id, user, alteration) => {
        try {
            const foundTransaction = await Transaction.findById(id);
            if (!foundTransaction)
                return new ServerError(404, 'Transaction not found');

            foundTransaction.set(alteration);
            foundTransaction.modifiedBy = user.id;

            await foundTransaction.save();

            return {
                message: 'Transaction updated',
                data: foundTransaction,
            };
        } catch (exception) {
            logger.error({
                method: 'update',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    delete: async () => {
        try{

        }catch(exception) {
            logger.error({
                method: 'delete',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong'); 
        }
    }
};

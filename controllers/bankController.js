const Bank = require('../models/bankModel');
const debug = require('debug')('app:bankModel');
const logger = require('../utils/logger')('bankCtrl.js');
const ServerError = require('../errors/serverError');

module.exports = {
    /**
     * Creates a new bank.
     * @param {string} name The name of the bank.
     * @param {string} code The sort code of the bank.
     */
    create: async function (name, code) {
        try {
            const newBank = new Bank({
                name,
                code,
            });

            await newBank.save();

            return {
                message: 'Bank created',
                data: newBank,
            };
        } catch (exception) {
            logger.error({
                method: 'create',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            if (exception.name === 'MongoServerError') {
                let field = Object.keys(exception.keyPattern)[0];
                field = field.charAt(0).toUpperCase() + field.slice(1);

                return new ServerError(409, field + ' already in use');
            }

            return new ServerError(500, 'Something went wrong');
        }
    },

    /**
     * Retrieves a bank.
     * @param {string} id The bank id.
     * @returns {Object} The bank object.
     */
    getOne: async function (id) {
        try {
            const bank = await Bank.findById(id);
            if (!bank) return new ServerError(404, 'Bank not found');

            return {
                message: 'success',
                data: bank,
            };
        } catch (exception) {
            logger.error({
                method: 'getOne',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    getAll: async function () {
        try {
            const banks = await Bank.find();
            if (banks.length === 0)
                return new ServerError(404, 'Banks not found');

            return {
                message: 'success',
                data: banks,
            };
        } catch (exception) {
            logger.error({
                method: 'getAll',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    update: async function (id, alteration) {
        try {
            const bank = await Bank.findByIdAndUpdate(id, alteration, {
                new: true,
            });

            return {
                message: 'Bank updated',
                data: bank,
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

    delete: async function (id) {
        try {
            const deletedBank = await Bank.findByIdAndRemove(id);

            return {
                message: 'Bank deleted',
                data: deletedBank,
            };
        } catch (exception) {
            logger.error({
                method: 'delete',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },
};

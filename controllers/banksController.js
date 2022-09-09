const Bank = require('../models/bank');
const debug = require('debug')('app:bankModel');
const logger = require('../utils/logger')('bankCtrl.js');

const CtrlFuncs = {
    /**
     * Creates a new bank.
     * @param {string} name The name of the bank.
     * @param {string} code The sort code of the bank.
     * @returns {{message: string, data: Object}} The new bank object
     */
    create: async function (name, code) {
        try {
            const newBank = new Bank({
                name,
                code,
            });

            await newBank.save();

            return {
                message: 'Bank created.',
                data: newBank,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            if (exception.name === 'MongoServerError') {
                let field = Object.keys(exception.keyPattern)[0];
                field = field.charAt(0).toUpperCase() + field.slice(1);

                return {
                    errorCode: 409,
                    message: field + ' has already been taken.',
                };
            }

            return { errorCode: 500, message: 'Something went wrong.' };
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
            if (!bank)
                return { errorCode: 404, message: 'Bank does not exist.' };

            return {
                message: 'Success',
                data: bank,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getAll: async function (queryParams = {}) {
        try {
            const banks = await Bank.find(queryParams);
            if (banks.length === 0)
                return { errorCode: 404, message: 'No banks found.' };

            return {
                message: 'Success',
                data: banks,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    update: async function (id, requestBody) {
        try {
            const bank = await Bank.findByIdAndUpdate(
                { _id: id },
                requestBody,
                { new: true }
            );
            if (!bank) return { errorCode: 404, message: 'Bank not found.' };

            return {
                message: 'Bank Updated.',
                data: bank,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    delete: async function (id) {
        try {
            const bank = await Bank.findByIdAndRemove(id);
            if (!bank) return { errorCode: 404, message: 'Bank not found.' };

            return {
                message: 'Bank Deleted.',
                data: bank,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },
};

module.exports = CtrlFuncs;

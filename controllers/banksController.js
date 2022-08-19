const Bank = require('../models/bankModel');
const debug = require('debug')('app:bankModel');

const bankFuncs = {
    /**
     * Creates a new bank.
     * @param {String} name The name of the bank.
     * @param {String} code The sort code of the bank.
     * @returns {{message: String, data: Object}} The new bank object
     */
    create: async function (name, code) {
        try {
            const bankExists = await Bank.findOne({ code: requestBody.code });
            if (bankExists)
                return { errorCode: 409, message: 'Bank already exists' };

            const newBank = new Bank({
                name,
                code,
            });

            await newBank.save();

            return {
                message: 'Bank created successfully',
                data: newBank,
            };
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    getOne: async function (id) {
        try {
            const bank = Bank.findById(id);
            if (!bank)
                return { errorCode: 404, message: 'Bank does not exist' };

            return bank;
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    getAll: async function (queryParams = {}) {
        try {
            const banks = await Bank.find(queryParams);
            if (banks.length === 0)
                return { errorCode: 404, message: 'No banks found' };

            return banks;
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    update: async function (id, requestBody) {
        try {
            const bank = await Bank.findByIdAndUpdate(
                { _id: id },
                requestBody,
                { new: true }
            );
            if (!bank) return { errorCode: 404, message: 'Bank not found' };

            return bank;
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    delete: async function (id) {
        try {
            const bank = await Bank.findByIdAndRemove(id);
            if (!bank) return { errorCode: 404, message: 'bank not found' };

            return bank;
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },
};

module.exports = bankFuncs;

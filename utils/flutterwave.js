const config = require('config');
const axios = require('axios').default;
const debug = require('debug')('app:FLW');
const { randomBytes } = require('crypto');
const logger = require('./logger')('flw.js');
const Flutterwave = require('flutterwave-node-v3');

const flw = new Flutterwave(
    config.get('flutterwave.flw_public_key'),
    config.get('flutterwave.flw_secret_key')
);

const URL = 'https://api.flutterwave.com/v3/payments';

const headers = {
    Authorization: `Bearer ${config.get('flutterwave.flw_secret_key')}`,
};

const paymentOptions = 'card, banktransfer, ussd, barter';

const flutterwaveCtrlFuncs = {
    getBanks: async function () {
        try {
            const response = await flw.Bank.country({ country: 'NG' });
            return response;
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return exception;
        }
    },

    /**
     * Generates a payment link from Flutterwave.
     * @param {Object} params
     * @param {String} params.amount - The amount to charge customer.
     * @param {String} params.currency - The currency to charge customer in.
     * @param {String} params.redirect_url - The URL to redirect the customer to after payment is done.
     * @param {Object} params.customerDetails
     * @param {String} params.customerDetails.email - The customer's email. Required
     * @param {String} params.customerDetails.name - The customer's name.
     * @param {String} params.customerDetails.phonenumber - The customer's phonenumber.
     * @param {Object} params.meta - An object containing any extra information to store alongside the transaction.
     * @param {Object} params.customizations - An object containing options to customize the look of the payment modal.
     * @param {String} params.customizations.title
     * @param {String} params.customizations.logo
     * @param {String} params.customizations.description
     * @returns
     */
    getFLWPaymentLink: async function (params) {
        try {
            const amount = params.amount.toString();
            const currency = params.hasOwnProperty('currency')
                ? params.currency
                : 'NGN';
            const redirect_url = params.hasOwnProperty('redirect_url')
                ? params.redirect_url
                : 'https://api.apexxialtd.com/v1/transactions/redirect';
            const customer = params.customerDetails;
            const meta = params.hasOwnProperty('meta') ? params.meta : {};
            const customizations = params.hasOwnProperty('customizations')
                ? params.customizations
                : { title: 'Apexxia' };

            const ref = randomBytes(6).toString('hex');
            const payload = {
                tx_ref: ref,
                amount,
                currency,
                redirect_url,
                customer,
                meta,
                customizations,
                payment_options: paymentOptions,
            };

            const response = await axios.post(URL, payload, { headers });
            response.data.data.reference = ref;

            return response;
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return exception;
        }
    },

    verifyTransaction: async function (id) {
        try {
            const response = await flw.Transaction.verify({ id: id });

            return response;
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return exception;
        }
    },
};

module.exports = flutterwaveCtrlFuncs;

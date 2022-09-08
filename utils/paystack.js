const config = require('config');
const axios = require('axios').default;
const debug = require('debug')('app:paystack');
const logger = require('./logger')('paystack.js');

const paymentURL = 'https://api.paystack.co/transaction/initialize';
let verifyURL = 'https://api.paystack.co/transaction/verify/:reference';

const headers = {
    'Content-Type': 'application/json',
    authorization: `Bearer ${config.get('paystack.paystack_secret_key')}`,
};

const paymentChannels = ['card', 'bank', 'ussd', 'bank_transfer'];

/**
 *
 * @param {number} amount
 * @returns {number} fee
 */
function calculateFee(amount) {
    let fee = 0.015 * amount;

    if (amount < 2_500) return fee;

    fee += 100;

    if (fee > 2_000) return 2_000;

    return fee;
}

const paystackCtrlFuncs = {
    /**
     * Generates a payment link.
     * @param {Object} params - Function Parameters
     * @property {number} params.amount - The amount to charge customer.
     * @property {string} params.email - The customer's email.
     * @property {string} [params.currency='NGN'] - The transaction currency.
     * @returns {Object} Returns a payment link from paystack.
     */
    getSKPaymentLink: async function (params) {
        try {
            let amount = params.amount;
            const email = params.email;
            const currency = params.hasOwnProperty('currency')
                ? params.currency
                : 'NGN';

            const payload = {
                amount,
                email,
                currency,
                channels: paymentChannels,
            };

            const fee = calculateFee(payload.amount);

            payload.metadata = {
                amount: payload.amount,
            };

            payload.amount = (payload.amount + fee) * 100;

            const response = await axios.post(paymentURL, payload, {
                headers,
            });

            return response;
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return exception;
        }
    },

    verifyTransaction: async function (ref) {
        try {
            const response = await axios.get(
                verifyURL.replace(':reference', ref.toString()),
                { headers }
            );

            return response;
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(`verify: ${exception}`);
            return exception;
        }
    },
};

module.exports = paystackCtrlFuncs;

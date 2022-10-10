const axios = require('axios').default;
const config = require('config');
const debug = require('debug')('app:paystack');
const logger = require('../utils/logger')('paystack.js');

class PaystackService {
    #headers;
    #payment_channels;
    #payment_url;
    #verify_txn_url;
    constructor() {
        this.#headers = {
            'Content-Type': 'application/json',
            authorization: `Bearer ${config.get(
                'paystack.secret_key'
            )}`,
        };
        this.#payment_channels = ['card', 'bank', 'ussd', 'bank_transfer'];
        this.#payment_url = 'https://api.paystack.co/transaction/initialize';
        this.#verify_txn_url =
            'https://api.paystack.co/transaction/verify/:reference';
    }

    /**
     * Calculates the transaction fee.
     * @param {number} amount
     * @returns {number} fee
     */
    #calcFee(amount) {
        let fee = 0.015 * amount;
        if (amount < 2_500) return fee;

        fee += 100;

        if (fee > 2_000) return 2_000;

        return fee;
    }

    /**
     * Generates a payment link.
     * @param {Object} params - Function Parameters
     * @property {number} params.amount - The amount to charge customer.
     * @property {string} params.email - The customer's email.
     * @property {string} [params.currency='NGN'] - The transaction currency.
     * @returns {Object} Returns a payment link from paystack.
     */
    async getPaymentLink(params) {
        try {
            let amount = params.amount;
            if (!amount)
                return { errorCode: 400, message: 'Amount is required.' };

            const email = params.email;
            if (!email)
                return { errorCode: 400, message: 'Email is required.' };

            const currency = params.hasOwnProperty('currency')
                ? params.currency
                : 'NGN';

            const payload = {
                amount,
                email,
                currency,
                channels: this.#payment_channels,
            };

            const fee = this.#calcFee(payload.amount);
            payload.amount = (payload.amount + fee) * 100;

            payload.metadata = {
                amount: payload.amount,
                fee: fee,
            };

            const response = await axios.post(this.#payment_url, payload, {
                headers: this.#headers,
            });

            return response;
        } catch (exception) {
            logger.error({
                method: 'getPaymentLink',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return exception;
        }
    }

    async verifyTxn(ref) {
        try {
            const response = await axios.get(
                this.#verify_txn_url.replace(':reference', ref.toString()),
                { headers: this.#headers }
            );

            return response;
        } catch (exception) {
            logger.error({
                method: 'verifyTxn',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return exception;
        }
    }
}

module.exports = new PaystackService();

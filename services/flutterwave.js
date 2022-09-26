const { randomBytes } = require('crypto');
const axios = require('axios').default;
const config = require('config');
const debug = require('debug')('app:FLW');
const Flutterwave = require('flutterwave-node-v3');
const logger = require('../utils/logger')('flw.js');

const flw = new Flutterwave(
    config.get('flutterwave.flw_public_key'),
    config.get('flutterwave.flw_secret_key')
);

class FlutterwaveService {
    #client;
    #headers;
    #payment_opts;
    #payment_url;
    constructor() {
        this.#client = flw;
        this.#headers = { Authorization: `Bearer ${config.get('flutterwave.flw_secret_key')}` };
        this.#payment_opts = 'card, banktransfer, ussd, barter';
        this.#payment_url = 'https://api.flutterwave.com/v3/payments';
    }

    /**
     * Retrieves all banks in Nigeria.
     * @returns an array of Nigerian banks with sort codes.
     */
    async getBanks() {
        try{
            const banks = await this.#client.Bank.country({ country: 'NG' });
            return banks;
        }catch(exception) {
            logger.error({method: 'getBanks', message: exception.message, meta: exception.stack });
            debug(exception)
            return exception;
        }
    }

    /**
     * Generates a payment link from Flutterwave.
     * @param {Object} params
     * @property {String} params.amount - The amount to charge customer.
     * @property {String} [params.currency='NGN'] - The currency to charge customer in.
     * @property {String} params.redirect_url - The URL to redirect the customer after payment.
     * @property {Object} params.customerDetails
     * @property {String} params.customerDetails.email - The customer's email. Required
     * @property {String} params.customerDetails.name - The customer's name.
     * @property {String} params.customerDetails.phonenumber - The customer's phonenumber.
     * @property {Object} params.meta - An object containing any extra information to store alongside the transaction.
     * @returns
     */
    async getPaymentLink(params) {
        try{
            const amount = params.amount.toString();
            if(!amount) return { errorCode: 400, message: 'Amount is required.'};

            const customer = params.customerDetails;
            if(Object.keys(customer).length < 3) return { errorCode: 400, message: 'Customer details is required.'};

            const currency = params.hasOwnProperty('currency')
                ? params.currency
                : 'NGN';

            const redirect_url = params.hasOwnProperty('redirect_url')
                ? params.redirect_url
                : 'https://api.apexxialtd.com/v1/transactions/redirect';
                
                const customizations = { title: 'Apexxia' };
            const meta = params.hasOwnProperty('meta') ? params.meta : {};

            const ref = randomBytes(6).toString('hex');
            const payload = {
                tx_ref: ref,
                amount,
                currency,
                redirect_url,
                customer,
                meta,
                customizations,
                payment_options: this.#payment_opts,
            };

            const response = await axios.post(this.#payment_url, payload, { headers: this.#headers });
            response.data.data.reference = ref;

            return response;
        }catch(exception) {
            logger.error({method: 'getPaymentLink', message: exception.message, meta: exception.stack });
            debug(exception);
            return exception;
        }
    }

    /**
     * Retrieves a transaction.
     * @param {number} id The transaction id.
     * @returns an object with the transaction details.
     */
    async verifyTxn(id) {
        try {
            const response = await flw.Transaction.verify({ id: id });
            return response;
        } catch (exception) {
            logger.error({method: 'verifyTransaction', message: exception.message, meta: exception.stack });
            debug(exception);
            return exception;
        }
    }
}


module.exports = new FlutterwaveService();

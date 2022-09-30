const flwService = require('../services/flutterwave');
const Lender = require('../models/lenderModel');
const ServerError = require('../errors/serverError');
const skService = require('../services/paystack');
const Transaction = require('../models/transaction');

/**
 * Generates a payment link based on user choice.
 * @param {Object} params - Function parameters
 * @property {string} params.id - The user's id.
 * @property {string} params.email - The user's email
 * @property {number} params.amount - The amount the user wishes to fund.
 * @property {number} [params.choice=0] - Paystack = 0; Flutterwave = 1.
 * @returns {Object} Returns a payment link from either Paystack or Flutterwave.
 */
async function getPaymentLink(params) {
    try {
        const id = params.id;
        const email = params.email;
        const amount = params.amount;
        let choice = params.choice !== undefined ? params.choice : 0;
        let response = null;

        const lender = await Lender.findById(id);
        if (!lender) return new ServerError(404, 'Lender not found');

        // get paystack link
        if (choice === 0)
            response = await skService.getPaymentLink({ amount, email });

        // if failure getting paystack fall back to flutterwave
        if (
            response.status !== 200 ||
            response instanceof Error ||
            choice === 1
        ) {
            response = await flwService.getPaymentLink({
                amount,
                customerDetails: {
                    name: lender.companyName,
                    email,
                    phonenumber: lender.phone,
                },
            });
        }

        if (response.status !== 200 || response instanceof Error)
            return new ServerError(424, 'Error initializing transaction.');

        const newTransaction = new Transaction({
            lenderId: lender._id.toString(),
            provider: choice ? 'Flutterwave' : 'Paystack',
            status: 'Pending',
            reference: response.data.data.reference,
            category: 'Credit',
            amount: amount,
            balance: lender.balance,
        });

        await newTransaction.save();

        return {
            message: 'Transaction initialized.',
            data: {
                reference: response.data.data.reference,
                paymentLink:
                    response.data.data.authorization_url ||
                    response.data.data.link,
            },
        };
    } catch (exception) {
        logger.error({
            method: getPaymentLink,
            message: exception.message,
            meta: exception.stack,
        });
        debug(exception);
        return { errorCode: 500, message: 'Something went wrong' };
    }
}

module.exports = {
    getPaymentLink,
};

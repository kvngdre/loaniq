const Lender = require('../models/lender');

const ctrlFuncs = {
    /**
     * Generates a payment link based on user choice.
     * @param {Object} params - Function parameters
     * @property {string} params.id - The user's id.
     * @property {string} params.email - The user's email
     * @property {number} params.amount - The amount the user wishes to fund.
     * @property {number} [params.choice=0] - Paystack = 0; Flutterwave = 1.
     * @returns {Object} Returns a payment link from either Paystack or Flutterwave.
     */
     getPaymentLink: async function (params) {
        try {
            const id = params.id;
            const email = params.email;
            const amount = params.amount;
            const choice = params.choice !== undefined ? params.choice : 0;

            let response = null;

            const lender = await Lender.findById(id);
            if (!lender) {
                logger.error({
                    message: 'User not found for generate payment link.',
                });
                debug(`Gen Pay Link Error lender - ${lender}`);
                return { errorCode: 500, message: 'Something went wrong.' };
            }

            // Paystack
            if (choice === 0)
                response = await getSKPaymentLink({ amount, email });

            // Flutterwave
            if (
                choice === 1 ||
                response.status !== 200 ||
                response instanceof Error
            ) {
                response = await getFLWPaymentLink({
                    amount,
                    customerDetails: {
                        name: lender.companyName,
                        email,
                        phonenumber: lender.phone,
                    },
                });
            }

            if (response.status !== 200 || response instanceof Error)
                return {
                    errorCode: 424,
                    message: 'Error generating payment link.',
                };

            logger.info({
                message: 'Payment link generated.',
                meta: {
                    provider: choice ? 'Flutterwave' : 'Paystack',
                    companyName: lender.companyName,
                    email: lender.email,
                    amount,
                    ref: response.data.data.reference,
                },
            });

            const newTransaction = await txnController.create({
                lenderId: lender._id.toString(),
                provider: choice ? 'Flutterwave' : 'Paystack',
                status: 'Pending',
                reference: response.data.data.reference,
                category: 'Credit',
                amount: amount,
                balance: lender.balance,
            });
            if (newTransaction.hasOwnProperty('errorCode')) {
                logger.error({
                    message: newTransaction.message,
                    meta: newTransaction.stack,
                });

                return {
                    errorCode: 500,
                    message: 'Something went wrong.',
                };
            }

            return {
                message: 'Payment link generated.',
                reference: response.data.data.reference,
                paymentLink:
                    response.data.data.authorization_url ||
                    response.data.data.link,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

}

module.exports = ctrlFuncs;
const config = require('config');
const crypto = require('crypto');
const stack = require('../utils/paystack');
const flw = require('../utils/flutterwave');
const Lender = require('../models/lenderModel');
const debug = require('debug')('app:webhookCtrl');
const logger = require('../utils/logger')('webhookCtrl.js');
const transactionController = require('./transactionController');

const webhooks = {
    paystack: async function (signature, payload) {
        try {
            const hash = crypto
                .createHmac(
                    'sha512',
                    config.get('paystack.paystack_secret_key')
                )
                .update(JSON.stringify(payload))
                .digest('hex');

            // Authenticate event.
            if (hash !== signature) {
                logger.info({
                    message: 'hash does not match pay stack signature',
                });
                debug('hash does not match pay stack signature');
                return 401;
            }

            debug('djsj=========', payload);

            logger.info({ message: 'paystack webhook', meta: payload });

            const transaction = await transactionController.getOne({
                reference: payload.data.reference,
                amount: payload.data.metadata.amount,
                status: 'Pending',
            });
            if (transaction.hasOwnProperty('errorCode')) {
                logger.error({
                    message: 'Failed to find transaction',
                    meta: {
                        lender: payload.data.customer.email,
                        stack: transaction,
                    },
                });
                return 200;
            }

            const {
                data: { data },
            } = await stack.verifyTransaction(payload.data.reference);

            if (
                payload.data.status === 'success' &&
                data.amount === payload.data.amount &&
                data.reference === payload.data.reference &&
                data.customer.email === payload.data.customer.email
            ) {
                const lender = await Lender.findOneAndUpdate(
                    { email: payload.data.customer.email },
                    {
                        $inc: {
                            balance: transaction.data.amount,
                        },
                        lastCreditDate: new Date(),
                    },
                    { new: true }
                ).select('-encryptedKey');
                if (!lender) {
                    debug('Failed to credit user.');
                    logger.error({
                        message: 'Failed to credit user.',
                        meta: {
                            email: payload.data.customer.email,
                            amount: transaction.data.amount,
                        },
                    });
                    return 401;
                }

                transaction.data.set({
                    status: 'Successful',
                    description: payload.data.message || payload.data.status,
                    channel: payload.data.channel,
                    balance: lender.balance,
                    bankName: payload.data?.authorization?.bank,
                    cardType: payload.data?.authorization?.card_type,
                    paidAt: payload.data.paid_at,
                });

                await transaction.data.save();

                return 200;
            } else {
                transaction.data.set({
                    status: 'Failed',
                    description: payload.data.status,
                    channel: payload.data.channel,
                    bankName: payload.data?.authorization?.bank,
                    cardType: payload.data?.authorization?.card_type,
                });

                await transaction.data.save();

                return 200;
            }
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return 401;
        }
    },

    flutterwave: async function (signature, payload) {
        try {
            // debug('djsj=========', payload);

            const secretHash = config.get('flutterwave.flw_webhook_hash');

            if (signature !== secretHash) return 401;

            logger.info({ message: 'flutterwave webhook', meta: payload });

            const transaction = await transactionController.getOne({
                reference: payload.txRef || payload.tx_Ref,
                amount: payload.amount,
                status: 'Pending',
            });
            if (transaction.hasOwnProperty('errorCode')) {
                logger.error({
                    message: 'Failed to find Flutterwave transaction.',
                    meta: {
                        reference: payload.txRef || payload.tx_Ref,
                        amount: payload.amount,
                        status: 'Pending',
                    },
                });
                return 401;
            }

            const { data } = await flw.verifyTransaction(payload.id);
            if (!data) {
                logger.error({
                    message: 'Failed to verify Flutterwave transaction.',
                    meta: { txn_id: payload.id },
                });
                debug('Failed to verify Flutterwave transaction.');
                return 401;
            }

            if (
                payload.status === 'successful' &&
                payload.status === data.status &&
                data.amount === payload.amount &&
                data.tx_ref === (payload.txRef || payload.tx_Ref) &&
                data.customer.email === payload.customer.email
            ) {
                const lender = await Lender.findOneAndUpdate(
                    { email: payload.customer.email },
                    {
                        $inc: {
                            balance: transaction.data.amount,
                        },
                        lastCreditDate: new Date(),
                    },
                    { new: true }
                ).select('-encryptedKey');
                if (!lender) {
                    debug('Failed to credit user.');
                    logger.error({
                        message: 'Failed to credit user.',
                        meta: {
                            email: payload.customer.email,
                            amount: transaction.data.amount,
                        },
                    });
                    return 401;
                }

                transaction.data.set({
                    status: 'Successful',
                    description: payload.narration || payload.status,
                    channel: payload.payment_type,
                    balance: lender.balance,
                    bankName: payload?.card?.issuer,
                    cardType: payload?.card?.type,
                    paidAt: new Date(),
                });

                await transaction.data.save();

                return 200;
            } else {
                transaction.data.set({
                    status: 'Failed',
                    description: payload.narration || payload.status,
                    channel: payload.payment_type,
                    bankName: payload?.card?.issuer,
                    cardType: payload?.card?.type,
                });

                await transaction.data.save();

                return 200;
            }
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return 401;
        }
    },
};

module.exports = webhooks;

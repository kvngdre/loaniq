const { txnStatus } = require('../utils/constants');
const config = require('config');
const crypto = require('crypto');
const debug = require('debug')('app:webhookCtrl');
const flwService = require('../services/flutterwave');
const Lender = require('../models/lenderModel');
const logger = require('../utils/logger')('webhookCtrl.js');
const paystackService = require('../services/paystack');
const Transaction = require('../models/transactionModel');

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

            // authenticate event.
            if (hash !== signature) {
                logger.error({
                    method: 'paystack',
                    message: 'hash does not match pay stack signature',
                });
                debug('hash does not match pay stack signature');
                return 401;
            }

            debug('djsj=========', payload);

            logger.info({
                message: 'received paystack webhook',
                meta: payload,
            });

            const queryFilter = {
                reference: payload.data.reference,
                amount: payload.data.metadata.amount,
                status: txnStatus.pending,
            };
            const foundTxn = await Transaction.findOne(queryFilter);
            // Transaction not found,
            if (!foundTxn) {
                // return 200 to paystack and do not credit wallet
                logger.error({
                    method: 'paystack',
                    message: 'Failed to find transaction',
                    meta: {
                        queryObj: {
                            lender: payload.data.customer.email,
                            ...queryFilter,
                        },
                    },
                });
                return 200;
            }

            const response = await paystackService.verifyTxn(
                payload.data.reference
            );
            if (response instanceof Error) {
                logger.error({
                    method: 'paystack_verify_txn',
                    message: 'Failed to verify paystack transaction',
                    meta: { reference: payload.data.reference },
                });
                debug('Failed to verify paystack transaction');
                return 401;
            }

            // transaction successful
            // TODO: do truthy check for data.status and payload.status
            if (
                payload.data.status === 'success' &&
                data.amount === payload.data.amount &&
                data.reference === payload.data.reference &&
                data.customer.email === payload.data.customer.email
            ) {
                // credit lender wallet
                const lender = await Lender.findOneAndUpdate(
                    { email: payload.data.customer.email },
                    {
                        $inc: {
                            balance: foundTxn.data.amount,
                        },
                        lastCreditDate: new Date(),
                    },
                    { new: true }
                );
                if (!lender) {
                    debug('Failed to credit lender.');
                    logger.error({
                        method: 'paystack',
                        message: 'Failed to credit lender wallet.',
                        meta: {
                            email: payload.data.customer.email,
                            amount: transaction.data.amount,
                        },
                    });
                    return 401;
                }

                // update transaction record
                foundTxn.set({
                    status: txnStatus.success,
                    desc: payload.data.message || payload.data.status,
                    channel: payload.data.channel,
                    balance: lender.balance,
                    bank: payload.data?.authorization?.bank,
                    cardType: payload.data?.authorization?.card_type,
                    paidAt: payload.data.paid_at,
                });
                await foundTxn.save();

                return 200;
            } else {
                // transaction failed, update record.
                foundTxn.set({
                    status: txnStatus.failed,
                    desc: payload.data.status,
                    channel: payload.data.channel,
                    bank: payload.data?.authorization?.bank,
                    cardType: payload.data?.authorization?.card_type,
                });
                await foundTxn.save();

                return 200;
            }
        } catch (exception) {
            logger.error({
                method: 'paystack',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return 401;
        }
    },

    flutterwave: async function (signature, payload) {
        try {
            debug('flutterwave', payload);

            // authenticate event
            const secretHash = config.get('flutterwave.flw_webhook_hash');
            if (signature !== secretHash) {
                logger.error({
                    method: 'flutterwave',
                    message: 'hash does not match flutterwave signature',
                });
                debug('hash does not match flutterwave signature');
                return 401;
            }

            // log event
            logger.info({ message: 'flutterwave webhook', meta: payload });

            const queryFilter = {
                reference: payload.txRef || payload.tx_Ref,
                amount: payload.amount,
                status: txnStatus.pending,
            };
            const foundTxn = await Transaction.findOne(queryFilter);
            if (!foundTxn) {
                logger.error({
                    method: 'flutterwave',
                    message: 'Failed to find transaction',
                    meta: {
                        queryObj: {
                            lender: payload.customer.email,
                            ...queryFilter,
                        },
                    },
                });
                return 401;
            }

            const { data } = await flwService.verifyTxn(payload.id);
            if (!data) {
                logger.error({
                    method: 'flutterwave_verify_txn',
                    message: 'Failed to verify Flutterwave transaction',
                    meta: { txn_id: payload.id },
                });
                debug('Failed to verify Flutterwave transaction');
                return 401;
            }

            // transaction successful
            // TODO: test webhook
            if (
                payload.status === 'successful' &&
                payload.status === data.status &&
                data.amount === payload.amount &&
                data.tx_ref === (payload.txRef || payload.tx_Ref) &&
                data.customer.email === payload.customer.email
            ) {
                // credit lender wallet
                const lender = await Lender.findOneAndUpdate(
                    { email: payload.customer.email },
                    {
                        $inc: {
                            balance: foundTxn.amount,
                        },
                        lastCreditDate: new Date(),
                    },
                    { new: true }
                );
                if (!lender) {
                    debug('Failed to credit lender wallet.');
                    logger.error({
                        message: 'Failed to credit lender wallet.',
                        meta: {
                            email: payload.customer.email,
                            amount: foundTxn.amount,
                        },
                    });
                    return 401;
                }

                // update transaction record
                foundTxn.set({
                    status: txnStatus.success,
                    description: payload.narration || payload.status,
                    channel: payload.payment_type,
                    balance: lender.balance,
                    bank: payload?.card?.issuer,
                    cardType: payload?.card?.type,
                    paidAt: new Date(),
                });
                await foundTxn.save();

                return 200;
            } else {
                // transaction failed, update transaction record
                foundTxn.set({
                    status: txnStatus.failed,
                    description: payload.narration || payload.status,
                    channel: payload.payment_type,
                    bank: payload?.card?.issuer,
                    cardType: payload?.card?.type,
                });
                await foundTxn.save();

                return 200;
            }
        } catch (exception) {
            logger.error({
                method: 'flutterwave',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return 401;
        }
    },
};

module.exports = webhooks;

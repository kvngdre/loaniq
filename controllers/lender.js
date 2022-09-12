const _ = require('lodash');
const config = require('config');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const userController = require('./user');
const Lender = require('../models/lender');
const txnController = require('./transaction');
const sendOTPMail = require('../utils/mailer');
const Settings = require('../models/settings');
const debug = require('debug')('app:lenderCtrl');
const generateOTP = require('../utils/generateOTP');
const { getSKPaymentLink } = require('../utils/paystack');
const logger = require('../utils/logger')('lenderCtrl.js');
const { getFLWPaymentLink } = require('../utils/flutterwave');

const ctrlFuncs = {
    create: async function (payload) {
        try {
            const encryptedPassword = await bcrypt.hash(
                payload.password,
                config.get('salt_rounds')
            );
            payload.password = encryptedPassword;

            payload.otp = generateOTP();

            // Sending OTP to email.
            // const mailResponse = await sendOTPMail(
            //     payload.email,
            //     payload.companyName,
            //     payload.otp.OTP
            // );
            // if (mailResponse instanceof Error) {
            //     debug(`Error sending OTP: ${mailResponse.message}`);
            //     return { errorCode: 502, message: 'Error sending OTP.' };
            // }

            const lender = new Lender(payload);
            await Settings.create({ userId: lender._id, type: 'Lender' });
            await lender.save();

            return {
                message: 'Account created and OTP has been sent to your email.',
                data: _.omit(lender._doc, ['otp', 'password']),
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);

            // Duplicate field error.
            if (exception.name === 'MongoServerError') {
                let field = Object.keys(exception.keyPattern)[0];
                field = field.charAt(0).toUpperCase() + field.slice(1);
                if (field === 'Phone') field = 'Phone number';

                return {
                    errorCode: 409,
                    message: field + ' has already been taken.',
                };
            }

            if (exception.name === 'ValidationError') {
                const field = Object.keys(exception.errors)[0];
                return {
                    errorCode: 400,
                    message: exception.errors[field].message,
                };
            }

            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getAll: async function () {
        try {
            const lenders = await Lender.find()
                .select('-password -otp')
                .sort('companyName');
            if (lenders.length === 0)
                return { errorCode: 404, message: 'No lenders found.' };

            return {
                message: 'Success',
                data: lenders,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getOne: async function (id) {
        try {
            const lender = await Lender.findById(id, {password: 0, otp: 0});
            if (!lender)
                return { errorCode: 404, message: 'Account not found.' };

            return {
                message: 'Success',
                data: lender,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    update: async function (id, alteration) {
        try {
            const lender = await Lender.findByIdAndUpdate(id, alteration, {
                new: true,
            });
            if (!lender)
                return { errorCode: 404, message: 'Account not found.' };

            return {
                message: 'Account Updated',
                data: _.omit(lender._doc, ['otp', 'password']),
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    verifyLender: async function (payload) {
        try {
            const lender = await Lender.findOne({ email: payload.email });
            if (!lender)
                return {
                    errorCode: 401,
                    message: 'Invalid email or password.',
                };

            // Comparing passwords.
            const isMatch = await bcrypt.compare(
                payload.password,
                lender.password
            );
            if (!isMatch)
                return {
                    errorCode: 401,
                    message: 'Incorrect email or password.',
                };

            if (lender.emailVerified)
                return { errorCode: 409, message: 'Email has been verified.' };

            if (
                Date.now() > lender.otp.expires ||
                payload.otp !== lender.otp.OTP
            )
                return { errorCode: 401, message: 'Invalid OTP.' };

                await lender.updateOne({
                    emailVerified: true,
                    'otp.OTP': null,
                    active: true,
                    lastLoginTime: new Date(),
                });
                
            lender._doc.token = lender.generateToken();

            return {
                message: 'Email verified and account activated.',
                data: _.omit(lender._doc, ['password', 'otp']),
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    login: async function (email, password) {
        try {
            const lender = await Lender.findOne({ email });
            if (!lender)
                return {
                    errorCode: 401,
                    message: 'Invalid email or password.',
                };

            const isMatch = await bcrypt.compare(
                password,
                lender.password
            );
            if (!isMatch)
                return {
                    errorCode: 401,
                    message: 'Invalid email or password.',
                };

            if (
                (lender.lastLoginTime === null || !lender.emailVerified) &&
                !lender.active
            ) {
                return {
                    message: 'New Lender.',
                    data: _.omit(lender._doc, ['password', 'otp']),
                };
            }

            if (
                lender.lastLoginTime !== null &&
                lender.emailVerified &&
                !lender.active
            )
                return {
                    errorCode: 403,
                    message: 'Account inactive. Contact administrator.',
                };
            // TODO: change to contact support

            await lender.updateOne({ lastLoginTime: new Date() });
            
            lender._doc.token = lender.generateToken();

            return {
                message: 'Login Successful.',
                data: _.omit(lender._doc, ['password', 'otp']),
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    changePassword: async function (
        email,
        newPassword,
        otp = null,
        currentPassword = null
    ) {
        try {
            const lender = await Lender.findOne({ email });
            if (!lender)
                return { errorCode: 404, message: 'Account not found.' };

            if (
                otp &&
                (Date.now() > lender.otp.expires || otp !== lender.otp.OTP)
            )
                return { errorCode: 401, message: 'Invalid OTP.' };

            if (currentPassword) {
                const isMatch = await bcrypt.compare(
                    currentPassword,
                    lender.password
                );
                if (!isMatch)
                    return {
                        errorCode: 401,
                        message: 'Password is incorrect.',
                    };

                if (newPassword === currentPassword)
                    return {
                        errorCode: 400,
                        message: 'New password is too similar to old password.',
                    };
            }

            const encryptedPassword = await bcrypt.hash(
                newPassword,
                config.get('salt_rounds')
            );

            await lender.update({
                'otp.OTP': null,
                password: encryptedPassword,
            });

            return {
                message: 'Password updated.',
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    createAdmin: async function (payload, user) {
        try {
            const adminUsers = await userController.getAll({
                lenderId: user.lenderId,
                role: 'Admin',
            });
            if (adminUsers.length > 0)
                return {
                    errorCode: 409,
                    message: 'Admin user already created.',
                };

            const adminUser = await userController.create(payload, user);
            if (adminUser.hasOwnProperty('errorCode')) return adminUser;

            return {
                message: 'Admin user created.',
                data: adminUser,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    sendOTP: async function (email, template) {
        try {
            const lender = await Lender.findOneAndUpdate(
                { email: email },
                { otp: generateOTP() },
                { new: true }
            ).select('email otp');
            if (!lender)
                return { errorCode: 404, message: 'Lender not found.' };

            const mailResponse = await sendOTPMail(
                email,
                lender.companyName,
                lender.otp.OTP
            );
            if (mailResponse instanceof Error) {
                debug(`Error sending OTP: ${mailResponse.message}`);
                return { errorCode: 502, message: 'Error sending OTP.' };
            }

            return {
                message: 'OTP has been sent to your email.',
                data: {
                    otp: lender.otp.OTP,
                    email: lender.email,
                },
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    /**
     * Retrieves the lender wallet balance.
     * @param {string} id Identifier for lender.
     * @returns
     */
     getBalance: async function (id) {
        try {
            const lender = await Lender.findById(id).select([
                'companyName',
                'balance',
            ]);
            if (!lender) return { errorCode: 404, message: 'Lender not found.' };

            return {
                message: 'Success',
                balance: lender.balance,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

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
            console.log('hi')
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


    deactivate: async function (id, password) {
        try {
            const lender = await Lender.findById(id);

            const isMatch = await bcrypt.compare(
                password,
                lender.password
            );
            if (!isMatch)
                return {
                    errorCode: 401,
                    message: 'Invalid email or password.',
                };

            await User.updateMany({ lenderId: lender._id }, { active: false });

            lender.set({ active: false });

            await lender.save();

            return {
                message: 'Account Deactivated.',
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },
};

module.exports = ctrlFuncs;

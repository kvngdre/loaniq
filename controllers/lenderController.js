const _ = require('lodash');
const bcrypt = require('bcrypt');
const config = require('config');
const debug = require('debug')('app:lenderCtrl');
const generateOTP = require('../utils/generateOTP');
const Lender = require('../models/lender');
const loanController = require('./loanController');
const logger = require('../utils/logger')('lenderCtrl.js');
const sendOTPMail = require('../utils/mailer');
const Settings = require('../models/settings');
const txnController = require('./transactionController');
const User = require('../models/user');
const userController = require('./userController');

const ctrlFuncs = {
    signUp: async function (payload) {
        try {
            const encryptedPassword = await bcrypt.hash(
                payload.password,
                parseInt(config.get('salt_rounds'))
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
            await lender.save();
            await Settings.create({ userId: lender._id, type: 'Lender' });
            // TODO: generate public URL.

            return {
                message: 'Account created and OTP has been sent to your email.',
                data: _.omit(lender._doc, ['otp', 'password', 'refreshTokens']),
            };
        } catch (exception) {
            logger.error({
                method: 'signUp',
                message: exception.message,
                meta: exception.stack,
            });
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
            logger.error({
                method: 'getAll',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getOne: async function (id) {
        try {
            const lender = await Lender.findById(id, { password: 0, otp: 0 });
            if (!lender)
                return { errorCode: 404, message: 'Account not found.' };

            return {
                message: 'Success',
                data: lender,
            };
        } catch (exception) {
            logger.error({
                method: 'getOne',
                message: exception.message,
                meta: exception.stack,
            });
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
            logger.error({
                method: 'update',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    verifySignUp: async function (payload) {
        try {
            const lender = await Lender.findOne({ email: payload.email }, { refreshTokens: 0 });
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
                return { errorCode: 409, message: 'Account has been verified.' };

            if (
                Date.now() > lender.otp.expires ||
                payload.otp !== lender.otp.OTP
            )
                return { errorCode: 401, message: 'Invalid OTP.' };

            lender.set({
                emailVerified: true,
                'otp.OTP': null,
                active: true,
                lastLoginTime: new Date(),
            });

            await lender.save();

            lender._doc.token = lender.generateAccessToken();

            return {
                message: 'Email verified and account activated.',
                data: _.omit(lender._doc, ['password', 'otp']),
            };
        } catch (exception) {
            logger.error({
                method: 'verifySignUp',
                message: exception.message,
                meta: exception.stack,
            });
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

            const isMatch = await bcrypt.compare(password, lender.password);
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

            lender._doc.accessToken = lender.generateAccessToken();
            lender._doc.refreshToken = await lender.generateRefreshToken();

            return {
                message: 'Login success.',
                data: _.omit(lender._doc, ['password', 'otp']),
            };
        } catch (exception) {
            logger.error({
                method: 'login',
                message: exception.message,
                meta: exception.stack,
            });
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
            logger.error({
                method: 'changePassword',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    createAdmin: async function (payload, user) {
        try {
            const adminUser = await userController.create(payload, user);
            if (adminUser.hasOwnProperty('errorCode')) return adminUser;

            return {
                message: 'User created. OTP & Password sent to email.',
                data: adminUser,
            };
        } catch (exception) {
            logger.error({
                method: 'createAdmin',
                message: exception.message,
                meta: exception.stack,
            });
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
            logger.error({
                method: 'sendOTP',
                message: exception.message,
                meta: exception.stack,
            });
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
            if (!lender)
                return { errorCode: 404, message: 'Lender not found.' };

                
            return {
                message: 'Success',
                data: lender.balance,
            };
        } catch (exception) {
            logger.error({
                method: 'getBalance',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    deactivate: async function (id, user, password) {
        try {
            const lender = await Lender.findById(id);

            const isMatch = await bcrypt.compare(password, lender.password);
            if (!isMatch)
                return {
                    errorCode: 401,
                    message: 'Password is incorrect.',
                };

            if (user.role !== 'Master') {
                // TODO: Create template for deactivation.
                const mailResponse = await sendOTPMail(
                    config.get('support.email'), // apexxia support
                    lender.companyName
                );
                if (mailResponse instanceof Error) {
                    debug(`Error sending OTP: ${mailResponse.message}`);
                    return {
                        errorCode: 502,
                        message: 'Error sending deactivation request.',
                    };
                }

                return {
                    message: 'Sent deactivation request.',
                };
            } else {
                await User.updateMany(
                    { lenderId: lender._id },
                    { active: false }
                );

                lender.set({ active: false });

                await lender.save();

                return {
                    message: 'Account Deactivated.',
                };
            }
        } catch (exception) {
            logger.error({
                method: 'deactivate',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    guestLoanReq: async function (payload) {
        try {
            const lender = await Lender.findOne({ id });

            user = {
                id: payload.customer.employmentInfo.ippis,
                lenderId: lender._id,
                role: 'guest',
                email: payload.customer.contactInfo.email,
            };

            const response = await loanController.createLoanReq(user, payload);

            return {
                message: 'Loan application submitted successfully.',
                data: response.data,
            };
        } catch (exception) {
            logger.error({
                method: 'guestLoanReq',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },
};

module.exports = ctrlFuncs;

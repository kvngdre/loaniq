const _ = require('lodash');
const { getPaymentLink } = require('../controllers/paymentController');
const { roles } = require('../utils/constants');
const bcrypt = require('bcrypt');
const config = require('config');
const debug = require('debug')('app:lenderCtrl');
const flattenObject = require('../utils/convertToDotNotation');
const generateOTP = require('../utils/generateOTP');
const generatePassword = require('../utils/generatePassword');
const Lender = require('../models/lenderModel');
const loanController = require('./loanController');
const logger = require('../utils/logger')('lenderCtrl.js');
const mailer = require('../utils/mailer');
const Settings = require('../models/settings');
const Segment = require('../models/segment');
const ServerError = require('../errors/serverError');
const User = require('../models/userModel');

module.exports = {
    create: async function (payload) {
        try {
            // TODO: generate public URL.
            const newLender = new Lender(payload.lender);
            const newUser = new User({
                lenderId: newLender._id.toString(),
                name: payload.user.name,
                email: payload.user.email,
                password: generatePassword(),
                role: roles.owner,
                otp: generateOTP(),
            });
            const settings = new Settings({
                userId: newUser._id,
            });
            // Sending OTP & Password to user email.
            const response = await mailer(
                newUser.email,
                newUser.name.firstName,
                newUser.otp.OTP,
                newUser.password
            );
            if (response instanceof Error) {
                debug(`Error OTP: ${response.message}`);
                return new ServerError(424, 'Failed to create account. Error sending OTP & password');
            }

            await newLender.save();
            await newUser.save();
            await settings.save();

            return {
                message: 'Lender created. Password & OTP sent to user email.',
                data: {
                    lender: newLender,
                    user: _.omit(newUser._doc, [
                        'password',
                        'otp',
                        'queryName',
                        'refreshTokens',
                    ]),
                },
            };
        } catch (exception) {
            logger.error({
                method: 'create',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);

            // duplicate field error
            if (exception.name === 'MongoServerError') {
                let field = Object.keys(exception.keyPattern)[0];
                field = field.charAt(0).toUpperCase() + field.slice(1);
                if (field === 'Phone') field = 'Phone number';

                return new ServerError(409, field + ' has already been taken');
            }

            // validation error
            if (exception.name === 'ValidationError') {
                const field = Object.keys(exception.errors)[0];
                return new ServerError(
                    400,
                    exception.errors[field].message.replace('Path', '')
                );
            }

            return new ServerError(500, 'Something went wrong');
        }
    },

    activate: async function (id, payload) {
        try {
            const { cacNumber, otp, support } = payload;

            const lender = await Lender.findById(id);
            if (!lender) return new ServerError(404, 'Tenant not found');

            if (Date.now() > lender.otp.exp || otp !== lender.otp.OTP) {
                // OTP not valid or expired.
                return new ServerError(400, 'Invalid OTP');
            }

            lender.set({
                emailVerified: true,
                active: true,
                'otp.OTP': null,
                'otp.exp': null,
                cacNumber,
                support
            });

            await lender.save();

            return {
                message: 'Tenant has been activated',
                data: _.omit(lender._doc, ['otp']),
            };
        } catch (exception) {
            logger.error({
                method: 'activate',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    getAll: async function () {
        try {
            const lenders = await Lender.find().sort('companyName');
            if (lenders.length === 0)
                return { errorCode: 404, message: 'Tenants not found' };

            return {
                message: 'success',
                data: lenders,
            };
        } catch (exception) {
            logger.error({
                method: 'getAll',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    getOne: async function (id) {
        try {
            const lender = await Lender.findById(id, { otp: 0 });
            if (!lender) return new ServerError(404, 'Lender not found.');

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
            return new ServerError(500, 'Something went wrong');
        }
    },

    update: async function (id, alteration) {
        try {
            alteration = flattenObject(alteration);

            const lender = await Lender.findById(id, { otp: 0 });
            if (!lender) return new ServerError(404, 'Lender not found');

            lender.set(alteration);
            await lender.save();

            return {
                message: 'Account Updated',
                data: lender,
            };
        } catch (exception) {
            logger.error({
                method: 'update',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);

            // validation error
            if (exception.name === 'ValidationError') {
                const field = Object.keys(exception.errors)[0];
                return new ServerError(
                    400,
                    exception.errors[field].message.replace('path', '')
                );
            }

            return { errorCode: 500, message: 'Something went wrong' };
        }
    },

    updateSettings: async function (id, payload) {
        try {
            // payload = convertToDotNotation(payload);
            const lender = await Lender.findById(id);
            if (!lender) return new ServerError(404, 'Tenant not found');

            if (payload.segment) {
                const isMatch = (segment) => segment.id === payload.segment.id;

                const index = lender.segments.findIndex(isMatch);
                if (index > -1) {
                    // segment found, update parameters
                    Object.keys(payload.segment).forEach((key) => {
                        lender.segments[index][key] = payload.segment[key];
                    });
                } else {
                    // segment not found, push new segment parameters
                    const segment = await Segment.findOne({
                        _id: payload.segment.id,
                        active: true,
                    });
                    // check if segment exists.
                    if (!segment)
                        return new ServerError(404, 'Segment Id not valid');

                    lender.segments.push(payload.segment);
                }
            }

            if (payload.loanParams) {
                Object.keys(payload.loanParams).forEach((key) => {
                    lender.loanParams[key] = payload.loanParams[key];
                });
            }

            await lender.save();

            return {
                message: 'Parameters updated.',
                data: _.omit(lender._doc, ['otp'])
            };
        } catch (exception) {
            logger.error({
                method: 'updateSettings',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);

            // duplicate error
            if (exception.name === 'MongoServerError') {
                let field = Object.keys(exception.keyPattern)[0];
                field = field.charAt(0).toUpperCase() + field.slice(1);

                return new ServerError(409, 'Duplicate' + field);
            }

            // validation error
            if (exception.name === 'ValidationError') {
                const field = Object.keys(exception.errors)[0];
                return new ServerError(
                    400,
                    exception.errors[field].message.replace('path', '')
                );
            }

            return new ServerError(500, 'Something went wrong');
        }
    },

    genPublicUrl: async function (id, ) {
        try{
            const lender = await Lender.findById(id);
            if(!lender) return new ServerError(404, 'Tenant not found.');
            if(!lender.active) return new ServerError(403, 'Tenant is yet to be activated.');

        }catch(exception) {

        }

    },

    fundWallet: async function(id, amount) {
        try{
            const lender = await Lender.findById(id);
            if(!lender) return new ServerError(404, 'Tenant not found.');
            if(!lender.active) return new ServerError(403, 'Tenant is yet to be activated');

            const link = await getPaymentLink({
                lenderId: lender._id.toString(),
                balance: lender.balance,
                amount,
                customer: {
                    name: lender.companyName,
                    email: lender.email,
                    phonenumber: lender.phone,
                }
            });
            if(link instanceof ServerError) return new ServerError(424, 'Failed to initialize transaction');

            return {
                message: 'success',
                data: link.data
            };
        }catch(exception) {
            logger.error({
                method: 'fundWallet',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    sendOtp: async function (id) {
        try {
            // TODO: add email template.
            const lender = await Lender.findById(id);
            if (!lender) return new ServerError(404, 'Tenant not found');

            lender.set({
                otp: generateOTP(),
            });
            const response = await mailer(
                lender.email,
                lender.companyName,
                lender.otp.OTP
            );
            console.log(response);
            if (response instanceof Error) {
                debug(`Error sending OTP: ${response.message}`);
                return new ServerError(424, 'Error sending OTP');
            }

            await lender.save();

            return {
                message: 'OTP sent to tenant email',
                data: {
                    email: lender.email,
                    otp: lender.otp.OTP,
                },
            };
        } catch (exception) {
            logger.error({
                method: 'sendOTP',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    /**
     * Retrieves the lender wallet balance.
     * @param {string} id Identifier for lender.
     * @returns
     */
    getBalance: async function (id) {
        try {
            const lender = await Lender.findById(id).select(
                'companyName balance'
            );
            if (!lender) return new ServerError(404, 'Tenant not found');

            return {
                message: 'success',
                data: {
                    balance: lender.balance
                },
            };
        } catch (exception) {
            logger.error({
                method: 'getBalance',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    deactivate: async function (id, user, password) {
        try {
            const lender = await Lender.findById(id);

            const isMatch = await bcrypt.compare(password, lender.password);
            if (!isMatch) return new ServerError(401, 'Password is incorrect');

            if (user.role !== roles.master) {
                // send a deactivation email request
                // TODO: Create template for deactivation.
                const response = await mailer(
                    config.get('support.email'), // apexxia support
                    lender.companyName,
                    user.fullName
                );
                if (response instanceof Error) {
                    debug(`Error sending OTP: ${response.message}`);
                    return new ServerError(
                        424,
                        'Error sending deactivation email request'
                    );
                }

                return {
                    message:
                        'Deactivation has been sent. We would get in touch with you shortly.',
                };
            } else {
                await User.updateMany(
                    { lenderId: lender._id },
                    { active: false }
                );

                lender.set({ active: false });

                await lender.save();
                // TODO: Send account deactivated to lender

                return {
                    message: 'Account deactivated',
                };
            }
        } catch (exception) {
            logger.error({
                method: 'deactivate',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
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

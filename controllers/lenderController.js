const _ = require('lodash');
const { roles } = require('../utils/constants');
const bcrypt = require('bcrypt');
const config = require('config');
const debug = require('debug')('app:lenderCtrl');
const generateOTP = require('../utils/generateOTP');
const Lender = require('../models/lenderModel');
const loanController = require('./loanController');
const logger = require('../utils/logger')('lenderCtrl.js');
const Segment = require('../models/segment');
const mailer = require('../utils/mailer');
const ServerError = require('../errors/serverError');
const User = require('../models/userModel');
const flattenObject = require('../utils/convertToDotNotation');

module.exports = {
    create: async function (payload) {
        try {
            const newLender = new Lender(payload);
            await newLender.save();

            // TODO: generate public URL.

            return {
                message: 'Lender created.',
                data: newLender,
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
                    exception.errors[field].message.replace('path', '')
                );
            }

            return new ServerError(500, 'Something went wrong');
            new ServerError(500, 'Something went wrong');
        }
    },

    verify: async function (id, otp) {
        try {
            if (!otp.match(/^[0-9]{8}$/))
                return new ServerError(400, 'Invalid OTP');

            const lender = await Lender.findById(id);
            if (!lender) return new ServerError(404, 'Lender not found');

            if (Date.now() > lender.otp.expires || otp !== lender.otp.OTP) {
                // OTP not valid or expired.
                return new ServerError(400, 'Invalid OTP');
            }

            await lender.updateOne({
                emailVerified: true,
                'otp.OTP': null,
            });

            return {
                message: 'Email has been verified',
                data: lender,
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

    getAll: async function () {
        try {
            const lenders = await Lender.find().sort('companyName');
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

            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    updateSettings: async function (id, payload) {
        try {
            // payload = convertToDotNotation(payload);
            const lender = await Lender.findById(id);
            if (!lender) return new ServerError(404, 'Lender not found');

            if (payload.segment) {
                const isMatch = (segment) => segment.id === payload.segment.id;

                const index = lender.segments.findIndex(isMatch);
                if (index > -1) {
                    // segment found, update parameters
                    Object.keys(payload.segment).forEach((key) => {
                        if (key === 'maxDti')
                            settings.segments[index]['useDefault'] = false;
                        settings.segments[index][key] = payload.segment[key];
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
                data: lender,
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

                return new ServerError(409, field + ' is already in use');
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

    sendOTP: async function (id) {
        try {
            // TODO: add email template.
            const lender = await Lender.findById(id).select('email otp');
            if (!lender) return new ServerError(404, 'Lender not found');

            lender.set({
                otp: generateOtp()
            });
            const response = await mailer(
                lender.email,
                lender.companyName,
                lender.otp.OTP
            );
            if (response instanceof Error) {
                debug(`Error sending OTP: ${response.message}`);
                return new ServerError(424, 'Error sending OTP');
            }

            await lender.save();

            return {
                message: 'OTP has been sent to your email',
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
            if (!lender) return new ServerError(404, 'Lender not found');

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
            return new ServerError(500, 'Something went wrong');
        }
    },

    deactivate: async function (id, user, password) {
        try {
            const lender = await Lender.findById(id);

            const isMatch = await bcrypt.compare(password, lender.password);
            if (!isMatch)
                return new ServerError(401, 'Password is incorrect');

            
            if (user.role !== roles.master) {
                // send a deactivation email request
                // TODO: Create template for deactivation.
                const mailResponse = await mailer(
                    config.get('support.email'), // apexxia support
                    lender.companyName,
                    user.fullName,
                );
                if (mailResponse instanceof Error) {
                    debug(`Error sending OTP: ${mailResponse.message}`);
                    return new ServerError(424, 'Error sending deactivation email request');
                }

                return {
                    message: 'Deactivation has been sent. We would get in touch with you shortly.',
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

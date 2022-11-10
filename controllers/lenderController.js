const _ = require('lodash');
const { getPaymentLink } = require('../controllers/paymentController');
const { roles } = require('../utils/constants');
const bcrypt = require('bcrypt');
const config = require('config');
const debug = require('debug')('app:lenderCtrl');
const emailValidator = require('deep-email-validator');
const flattenObject = require('../utils/flattenObj');
const generateOTP = require('../utils/generateOTP');
const generateShortUrl = require('../utils/generateShortUrl');
const Lender = require('../models/lenderModel');
const loanController = require('./loanController');
const logger = require('../utils/logger')('lenderCtrl.js');
const mailer = require('../utils/mailer');
const mongoose = require('mongoose');
const Segment = require('../models/segmentModel');
const ServerError = require('../errors/serverError');
const Settings = require('../models/settings');
const User = require('../models/userModel');

module.exports = {
    create: async (payload) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            const newLender = new Lender(payload.lender);
            const randomPwd = Math.random().toString(36).substring(2, 8);
            const newUser = new User({
                lender: newLender._id.toString(),
                name: payload.user.name,
                email: payload.user.email,
                phone: payload.user.phone,
                password: randomPwd,
                role: roles.owner,
                otp: generateOTP(),
            });
            const newSettings = new Settings({
                userId: newUser._id,
            });

            // const { valid } = await emailValidator.validate(newUser.email);
            // if(!valid) return new ServerError(400, 'Please provide a valid email');
            

            // validating  new user
            // const userError = newUser.validateSync();
            // if (userError) {
            //     const msg =
            //         userError.errors[Object.keys(userError.errors)[0]].message;
            //     return new ServerError(400, msg);
            // }

            // validating new user settings
            const settingsError = newSettings.validateSync();
            if (settingsError) {
                const msg =
                    settingsError.errors[Object.keys(settingsError.errors)[0]]
                        .message;
                return new ServerError(400, msg);
            }

            await newLender.save({ session: session });
            await newUser.save({ session: session });
            await newSettings.save({ session: session });

            // mailing one-time-pin and one-time-password
            const response = await mailer({
                to: newUser.email,
                subject: 'Almost there, just one more step',
                name: newUser.name.first,
                template: 'new-user',
                payload: { otp: newUser.otp.OTP, password: randomPwd },
            });
            if (response instanceof Error) {
                // if error occurs sending email, abort the whole transaction and
                // undo any changes that might have happened.
                // await newLender.delete();
                // await newUser.delete();
                // await newSettings.delete();
                await session.abortTransaction();
                session.endSession();

                logger.error({
                    method: 'create',
                    message: response.message,
                    meta: response.stack,
                });
                debug(response.message);
                return new ServerError(
                    424,
                    'Failed to create account. Error sending OTP & password'
                );
            }

            await session.commitTransaction();
            session.endSession();

            return {
                message: 'Tenant created. Password and OTP sent to email.',
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
            // if an error occurred abort the whole transaction
            // and undo any changes that might have happened.
            await session.abortTransaction();
            session.endSession();

            logger.error({
                method: 'create',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);

            // duplicate field error
            if (exception.name === 'MongoServerError' && exception.code === 11000) {
                let field = Object.keys(exception.keyPattern)[0];
                field = field.charAt(0).toUpperCase() + field.slice(1);
                if (field === 'Phone') field = 'Phone number';

                return new ServerError(409, field + ' already in use.');
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

    activate: async (id, payload) => {
        try {
            // TODO: work on this
            const { cacNumber, otp, support } = payload;

            const foundLender = await Lender.findById(id);
            if (!foundLender) return new ServerError(404, 'Tenant not found');

            if (
                Date.now() > foundLender.otp.exp ||
                otp !== foundLender.otp.OTP
            ) {
                // OTP not valid or expired.
                return new ServerError(401, 'Invalid OTP');
            }

            foundLender.set({
                emailVerified: true,
                active: true,
                'otp.OTP': null,
                'otp.exp': null,
                cacNumber,
                support,
            });

            await foundLender.save();

            return {
                message: 'Tenant has been activated',
                data: _.omit(foundLender._doc, ['otp']),
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

    getAll: async (filters) => {
        try {
            const sortBy = filters?.sort ? filters.sort : 'companyName';
            const queryParams = {};

            applyFilters(filters);
            function applyFilters(filters) {
                if (filters?.name)
                    queryParams.companyName = new RegExp(filters.name, 'i');

                // number filter - wallet balance
                if (filters?.min) queryParams.balance = { $gte: filters.min };
                if (filters?.max) {
                    const target = queryParams.balance
                        ? queryParams.balance
                        : {};
                    queryParams.balance = Object.assign(target, {
                        $lte: filters.max,
                    });
                }
            }

            const lenders = await Lender.find(queryParams).sort(sortBy);
            if (lenders.length === 0)
                return { errorCode: 404, message: 'No Tenants found' };

            return {
                message: 'success',
                data: lenders,
            };
        } catch (exception) {
            logger.error({
                method: 'get_all',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    getOne: async (id, filters) => {
        try {
            const queryParams = mongoose.isValidObjectId(id)
                ? { _id: id }
                : { publicUrl: id };
            const foundLender = await Lender.findOne(queryParams)
                .select(filters)
                .select('-_id -otp');
            if (!foundLender) return new ServerError(404, 'Tenant not found.');

            if (!mongoose.isValidObjectId(id))
                var token = foundLender.generateToken();

            const payload = _.omit(foundLender._doc, ['_id']);
            payload.token = token;

            return {
                message: 'success',
                data: payload,
            };
        } catch (exception) {
            logger.error({
                method: 'get_one',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    update: async (id, alteration) => {
        try {
            alteration = flattenObject(alteration);

            const lender = await Lender.findById(id, { otp: 0 });
            if (!lender) return new ServerError(404, 'Tenant not found');

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

    updateSettings: async (id, payload) => {
        try {
            // payload = convertToDotNotation(payload);
            const foundLender = await Lender.findById(id);
            if (!foundLender) return new ServerError(404, 'Tenant not found');
            if (!foundLender.active)
                return new ServerError(403, 'Tenant is yet to be activated.');

            if (payload?.segment) {
                const isMatch = (segment) =>
                    segment.id.toString() === payload.segment.id;

                const index = foundLender.segments.findIndex(isMatch);
                console.log(index);

                if (index > -1) {
                    // segment found, update parameters
                    Object.keys(payload.segment).forEach(
                        (key) =>
                            (foundLender.segments[index][key] =
                                payload.segment[key])
                    );
                } else {
                    // segment not found, push new segment parameters
                    const foundSegment = await Segment.findById(
                        payload.segment.id
                    );
                    // check if segment exists.
                    if (!foundSegment || !foundSegment.active)
                        return new ServerError(404, 'Segment not found');

                    foundLender.segments.push(payload.segment);
                }
            }

            if (payload.defaultParams) {
                Object.keys(payload.defaultParams).forEach((key) => {
                    foundLender.defaultParams[key] = payload.defaultParams[key];
                });
            }

            await foundLender.save();

            return {
                message: 'Parameters updated.',
                data: _.omit(foundLender._doc, ['otp']),
            };
        } catch (exception) {
            logger.error({
                method: 'update_settings',
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

    genPublicUrl: async (id) => {
        try {
            const foundLender = await Lender.findById(id);
            if (!foundLender) return new ServerError(404, 'Tenant not found.');
            if (!foundLender.active)
                return new ServerError(403, 'Tenant is yet to be activated.');

            const shortUrl = await generateShortUrl();
            foundLender.set({
                publicUrl: shortUrl,
            });
            await foundLender.save();

            return {
                message: 'success',
                data: `http://apexxia.co/f/${shortUrl}`,
            };
        } catch (exception) {
            logger.error({
                method: 'gen_public_url',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    fundWallet: async (id, amount) => {
        try {
            const foundLender = await Lender.findById(id);
            if (!foundLender) return new ServerError(404, 'Tenant not found');
            if (!foundLender.active)
                return new ServerError(403, 'Tenant is yet to be activated');

            const link = await getPaymentLink({
                lender: foundLender._id.toString(),
                balance: foundLender.balance,
                amount,
                customer: {
                    name: foundLender.companyName,
                    email: foundLender.email,
                    phonenumber: foundLender.phone,
                },
            });
            if (link instanceof ServerError)
                return new ServerError(424, 'Failed to initialize transaction');

            return {
                message: 'success',
                data: link.data,
            };
        } catch (exception) {
            logger.error({
                method: 'fund_wallet',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    requestOtp: async (id) => {
        try {
            // TODO: add email template.
            const foundLender = await Lender.findById(id);
            if (!foundLender) return new ServerError(404, 'Tenant not found');

            foundLender.set({
                otp: generateOTP(),
            });

            // mailing OTPs
            const response = await mailer({
                to: foundLender.email,
                subject: 'Your one-time-pin request',
                name: foundLender.companyName,
                template: 'otp-request',
                payload: { otp: foundLender.otp.OTP },
            });
            if (response instanceof Error) {
                debug(`Error sending OTP: ${response.message}`);
                return new ServerError(424, 'Error sending OTP');
            }

            await foundLender.save();

            return {
                message: 'OTP sent to tenant email',
                data: {
                    email: foundLender.email,
                    // TODO: remove otp
                    otp: foundLender.otp.OTP,
                },
            };
        } catch (exception) {
            logger.error({
                method: 'request_otp',
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
    getBalance: async (id) => {
        try {
            const lender = await Lender.findById(id).select(
                'companyName active balance'
            );
            if (!lender) return new ServerError(404, 'Tenant not found');

            return {
                message: 'success',
                data: {
                    balance: lender.balance,
                },
            };
        } catch (exception) {
            logger.error({
                method: 'get_balance',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    deactivate: async (id, user, password) => {
        try {
            const foundLender = await Lender.findById(id);

            const isMatch = await bcrypt.compare(
                password,
                foundLender.password
            );
            if (!isMatch) return new ServerError(401, 'Password is incorrect');

            if (user.role !== roles.master) {
                // send a deactivation email request
                // TODO: Create template for deactivation.
                const response = await mailer(
                    config.get('support.email'), // apexxia support
                    foundLender.companyName,
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
                    { lender: foundLender._id.toString() },
                    { active: false }
                );

                foundLender.set({ active: false });

                await foundLender.save();
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

    reactivate: async (id) => {
        try {
            const foundLender = await Lender.findOne({
                _id: id,
                active: false,
            });
            if (!foundLender) return new ServerError(404, 'Tenant not found');

            const foundUser = await User.findOne({
                lender: foundLender.id.toString(),
                role: 'Owner',
                active: false,
            });
            if (!foundUser) return new ServerError(404, 'Owner user not found');

            foundLender.set({ active: true });
            foundUser.set({ active: true });

            await foundLender.save();
            await foundUser.save();

            return {
                message: 'Tenant reactivated',
            };
        } catch (exception) {
            logger.error({
                method: 'reactivate',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    handleGuestLoan: async (payload) => {
        try {
            const lender = await Lender.findOne({ id });

            user = {
                id: payload.customer.employmentInfo.ippis,
                lender: lender._id.toString(),
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
                method: 'handle_guest_loan',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },
};

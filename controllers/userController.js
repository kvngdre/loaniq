const _ = require('lodash');
const { roles } = require('../utils/constants');
const bcrypt = require('bcrypt');
const config = require('config');
const User = require('../models/userModel');
const debug = require('debug')('app:userCtrl');
const mailer = require('../utils/mailer');
const Segment = require('../models/segment');
const generateOTP = require('../utils/generateOTP');
const logger = require('../utils/logger')('userCtrl.js');
const generatePassword = require('../utils/generatePassword');
const ServerError = require('../errors/serverError');

const userCtrlFuncs = {
    /**
     *  function creates a user.
     * @param {object} payload
     * @param {object} user
     * @returns A new user.
     */
    create: async function (payload, user) {
        try {
            const allSegments = await Segment.find().select('_id');
            switch (payload.role) {
                case roles.admin:
                    if (user.role !== roles.owner) return new ServerError(401, 'Unauthorized');
                    var temporaryPassword = generatePassword();

                    var newUser = new User({
                        lenderId: user.id,
                        name: payload.name,
                        displayName: payload.displayName,
                        phone: payload.phone,
                        email: payload.email,
                        password: temporaryPassword,
                        otp: generateOTP(),
                        role: payload.role,
                        timeZone: payload.timeZone,
                    });
                    break;

                case roles.credit:
                    var temporaryPassword = generatePassword();

                    var newUser = new User({
                        lenderId: user.lenderId,
                        name: payload.name,
                        displayName: payload.displayName,
                        phone: payload.phone,
                        email: payload.email,
                        password: temporaryPassword,
                        otp: generateOTP(),
                        role: payload.role,
                        segments:
                            payload.segments === 'all'
                                ? allSegments
                                : payload.segments,
                        timeZone: payload.timeZone,
                    });
                    break;

                case roles.operations:
                    var temporaryPassword = generatePassword();
                    
                    var newUser = new User({
                        lenderId: user.lenderId,
                        name: payload.name,
                        displayName: payload.displayName,
                        phone: payload.phone,
                        email: payload.email,
                        password: temporaryPassword,
                        otp: generateOTP(),
                        role: payload.role,
                        timeZone: payload.timeZone,
                    });
                    break;

                case roles.agent:
                    var temporaryPassword = generatePassword();

                    var newUser = new User({
                        lenderId: user.lenderId,
                        name: payload.name,
                        displayName: payload.displayName,
                        phone: payload.phone,
                        email: payload.email,
                        password: temporaryPassword,
                        otp: generateOTP(),
                        role: payload.role,
                        segments:
                            payload.segments === 'all'
                                ? allSegments
                                : payload.segments,
                        target: payload.target,
                        timeZone: payload.timeZone,
                    });
                    break;
            }

            await newUser.save();
            // newUser.password = temporaryPassword;

            // Sending OTP & Password to user email.
            const response = await mailer(
                payload.email,
                payload.name.firstName,
                newUser.otp.OTP,
                temporaryPassword
            );
            if (response instanceof Error) {
                debug(`Error OTP: ${response.message}`);
                return { errorCode: 502, message: 'Error sending OTP & password.' };
            }

            return {
                message:
                    'Success. OTP and password has been sent to user email.',
                data: newUser,
            };
        } catch (exception) {
            logger.error({method: 'create', message: exception.message, meta: exception.stack });
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

            // Validation Error
            if (exception.name === 'ValidationError') {
                const field = Object.keys(exception.errors)[0];
                return {
                    errorCode: 400,
                    message: exception.errors[field].message.replace('Path', ''),
                };
            }

            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getAll: async function (lenderId, filters) {
        try {
            const queryParams = { lenderId };

            const users = await User.find(queryParams, {
                password: 0,
                otp: 0,
            }).sort('name.firstName');
            if (users.length === 0)
                return { errorCode: 404, message: 'No users found.' };

            return users;
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getOne: async function (id, filters) {
        try {
            const queryParams = Object.assign({ _id: id }, filters);

            const user = await User.findOne(queryParams, {
                password: 0,
                otp: 0,
            });
            if (!user)
                return { errorCode: 404, message: 'User not found.' };

            return user;
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    update: async function (id, alteration, filters) {
        try {
            const queryParams = Object.assign({ _id: id }, filters);

            const user = await User.findByIdAndUpdate(queryParams, alteration, {
                new: true,
            }).select('-password');
            if (!user) return { errorCode: 404, message: 'User document not found.' };

            // TODO: how to specify if it's a delete or ADD??
            // TODO: ask front end if the can build the array.

            return {
                message: 'User Updated.',
                data: user,
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
            const user = await User.findOne({ email });
            if (!user) return { errorCode: 404, message: 'User document not found.' };

            if (otp && (Date.now() > user.otp.expires || otp !== user.otp.OTP))
                return { errorCode: 401, message: 'Invalid OTP.' };

            if (currentPassword) {
                const isValid = await bcrypt.compare(
                    currentPassword,
                    user.password
                );
                if (!isValid)
                    return {
                        errorCode: 401,
                        message: 'Incorrect password.',
                    };

                if (newPassword === currentPassword)
                    return {
                        errorCode: 400,
                        message: 'New password is too similar to old password.',
                    };
            }

            const encryptedPassword = await bcrypt.hash(
                newPassword,
                parseInt(config.get('salt_rounds'))
            );

            await user.updateOne({ 'otp.OTP': null, password: encryptedPassword });

            return {
                message: 'Password updated.',
            };
        } catch (exception) {
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    sendOTP: async function (email, template) {
        try {
            const user = await User.findOneAndUpdate(
                { email },
                { otp: generateOTP() },
                { new: true }
            ).select('email otp');
            if (!user) return { errorCode: 404, message: 'User document not found.' };

            const mailResponse = await mailer(
                email,
                user.name.firstName,
                user.otp.OTP
            );
            if (mailResponse instanceof Error) {
                debug(`Error sending OTP: ${mailResponse.message}`);
                return {
                    errorCode: 502,
                    message: 'Error sending OTP.',
                };
            }

            return {
                message: 'OTP sent to email.',
                data: {
                    otp: user.otp.OTP,
                    email: user.email,
                },
            };
        } catch (exception) {
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    // delete: async function(id) {
    //     try{
    //         const user = await User.findById(id);
    //         if(!user) throw new Error('User not found.');

    //         if(user.customers.length > 0) {
    //             return 'Are you sure you want to delete?';
    //         };

    //         user.deleteOne()

    //         return user;

    //     }catch(exception) {
    //         debug(exception)
    //         return exception;
    //     }
    // },
};

module.exports = userCtrlFuncs;

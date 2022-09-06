const _ = require('lodash');
const bcrypt = require('bcrypt');
const config = require('config');
const User = require('../models/userModel');
const debug = require('debug')('app:userCtrl');
const sendOTPMail = require('../utils/sendMail');
const Segment = require('../models/segmentModel');
const generateOTP = require('../utils/generateOTP');
const generateRandomPassword = require('../utils/generatePassword');

const userCtrlFuncs = {
    /**
     *  function creates a user.
     * @param {string} role
     * @param {object} payload
     * @param {object} user
     * @returns A new user.
     */
    create: async function (payload, user) {
        try {
            const rounds = config.get('salt_rounds');
            const allSegments = await Segment.find().select('_id');

            switch (payload.role) {
                case 'Admin':
                    if (user.role !== 'Lender') return 401;

                    // Encrypting password
                    var temporaryPassword = generateRandomPassword();
                    var encryptedTempPassword = await bcrypt.hash(
                        temporaryPassword,
                        rounds
                    );

                    var newUser = new User({
                        name: payload.name,
                        // displayName: requestBody?.displayName,
                        phone: payload.phone,
                        email: payload.email,
                        password: encryptedTempPassword,
                        otp: generateOTP(),
                        role: payload.role,
                        active: payload.active,
                        lenderId: user.id,
                    });
                    break;

                case 'Credit':
                    // Encrypting password
                    var temporaryPassword = generateRandomPassword();
                    var encryptedPassword = await bcrypt.hash(
                        temporaryPassword,
                        rounds
                    );

                    var newUser = new User({
                        name: payload.name,
                        // displayName: requestBody?.displayName,
                        phone: payload.phone,
                        email: payload.email,
                        password: encryptedPassword,
                        otp: generateOTP(),
                        role: payload.role,
                        active: payload.active,
                        segments:
                            payload.segments === 'all'
                                ? allSegments
                                : payload.segments,
                        lenderId: user.lenderId,
                    });
                    break;

                case 'Operations':
                    var temporaryPassword = generateRandomPassword();
                    var encryptedPassword = await bcrypt.hash(
                        temporaryPassword,
                        rounds
                    );

                    var newUser = new User({
                        name: payload.name,
                        // displayName: requestBody?.displayName,
                        phone: payload.phone,
                        email: payload.email,
                        password: encryptedPassword,
                        otp: generateOTP(),
                        role: payload.role,
                        active: payload.active,
                        lenderId: user.lenderId,
                    });
                    break;

                case 'Loan Agent':
                    var temporaryPassword = generateRandomPassword();
                    var encryptedPassword = await bcrypt.hash(
                        temporaryPassword,
                        rounds
                    );

                    var newUser = new User({
                        name: payload.name,
                        // displayName: requestBody?.displayName,
                        phone: payload.phone,
                        email: payload.email,
                        password: encryptedPassword,
                        otp: generateOTP(),
                        role: payload.role,
                        active: payload.active,
                        segments:
                            payload.segments === 'all'
                                ? allSegments
                                : payload.segments,
                        target: payload.target,
                        lenderId: user.lenderId,
                    });
                    break;
            }

            await newUser.save();
            newUser.password = temporaryPassword;

            // sending otp in mail
            const mailResponse = await sendOTPMail(
                payload.email,
                payload.name.firstName,
                newUser.otp.OTP,
                temporaryPassword
            );
            if (mailResponse instanceof Error) {
                debug(`Error OTP: ${mailResponse.message}`);
                return { errorCode: 502, message: 'Error sending OTP.' };
            }

            return {
                message: 'User created. OTP and password sent to user email',
                data: newUser,
            };
        } catch (exception) {
            // logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
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

    getAll: async function (lenderId, filters = {}) {
        try {
            let queryParams = { lenderId };

            if (Object.keys(filters).length > 0)
                queryParams = Object.assign(queryParams, filters);

            const users = await User.find(queryParams)
                .select('-password -otp -__v')
                .sort('name.firstName');
            if (users.length === 0)
                return { errorCode: 404, message: 'Users not found.' };

            return users;
        } catch (exception) {
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getOne: async function (id, filters = {}) {
        try {
            let queryParams = { _id: id };
            if (Object.keys(filters).length > 0)
                queryParams = Object.assign(queryParams, filters);

            const user = await User.findOne(queryParams, {
                password: 0,
                otp: 0,
            });
            if (!user) return { errorCode: 404, message: 'User not found.' };

            return user;
        } catch (exception) {
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    update: async function (id, alteration, filters = {}) {
        try {
            let queryParams = { _id: id };
            if (Object.keys(filters).length > 0)
                queryParams = Object.assign(queryParams, filters);

            const user = await User.findByIdAndUpdate(queryParams, alteration, {
                new: true,
            }).select('-password');
            if (!user) return { errorCode: 404, message: 'User not found.' };

            // TODO: how to specify if it's a delete or ADD??
            // TODO: ask front end if the can build the array.

            return {
                message: 'User Updated.',
                data: user,
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
            if (!user) return { errorCode: 404, message: 'User not found.' };

            const mailResponse = await sendOTPMail(
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
                    email: user.email
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

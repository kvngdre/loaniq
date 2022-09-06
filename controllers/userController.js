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

    login: async function (email, password) {
        try {
            let user = await User.findOne({ email }, {otp: 0});
            if (!user)
                return { errorCode: 401, message: 'Invalid email or password.' };
            
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid)
                return { errorCode: 401, message: 'Invalid email or password.' };

            if (
                (user.lastLoginTime === null || !user.emailVerified) &&
                !user.active
            ) {
                return {
                    message: 'New User',
                    user: _.omit(user, ['password'])
                };
            }

            if (
                user.lastLoginTime !== null &&
                user.emailVerified &&
                !user.active
            )
                return {
                    errorCode: 403,
                    message: 'Account inactive. Contact support.',
                };

            user.token = user.generateToken();
            await user.updateOne({ lastLoginTime: Date.now() });
            
            user = _.pick(user, [
                '_id',
                'displayName',
                'email',
                'role',
                'lastLoginTime',
                'token',
            ]);


            return {
                message: 'Login Successful.',
                user
            };
        } catch (exception) {
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    verifyUser: async function (payload) {
        try {
            const user = await User.findOne({ email: payload.email });
            if (!user)
                return {
                    errorCode: 401,
                    message: 'Invalid email or password.',
                };

            const isValid = await bcrypt.compare(
                payload.password,
                user.password
            );
            if (!isValid)
                return {
                    errorCode: 401,
                    message: 'Incorrect email or password.',
                };

            if (user.emailVerified)
                return { errorCode: 409, message: 'User already verified.' };

            if (Date.now() > user.otp.expires || payload.otp !== user.otp.OTP)
                return { errorCode: 401, message: 'Invalid OTP.' };

            user.token = user.generateToken();
            authUser = _.pick(user, [
                '_id',
                'firstName',
                'lastName',
                'phone',
                'email',
                'role',
                'token',
            ]);

            await user.updateOne({
                emailVerified: true,
                'otp.OTP': null,
                active: true,
                lastLoginTime: Date.now(),
            });

            return {
                message: 'Email verified and account activated.',
                user: authUser,
            };
        } catch (exception) {
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
            if (!user) return { errorCode: 404, message: 'User not found.' };

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
                config.get('salt_rounds')
            );

            await user.update({ 'otp.OTP': null, password: encryptedPassword });

            return {
                message: 'Password updated',
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

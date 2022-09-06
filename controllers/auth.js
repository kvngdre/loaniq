const _ = require('lodash');
const bcrypt = require('bcrypt');
const config = require('config');
const debug = require('debug')('app:auth');
const User = require('../models/userModel');

const auth = {
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
};

module.exports = auth;

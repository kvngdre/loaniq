const _ = require('lodash');
const bcrypt = require('bcrypt');
const config = require('config');
const debug = require('debug')('app:authCtrl');
const logger = require('../utils/logger')('authCtrl.js');
const ServerResponse = require('../utils/ServerResponse');
const similarity = require('../utils/similarity');
const User = require('../models/userModel');

async function login(email, password, cookies, res) {
    try {
        const foundUser = await User.findOne({ email }, { queryName: 0 });
        if (!foundUser) return new ServerResponse(401, 'Invalid credentials');

        const isMatch = await foundUser.comparePasswords(password);
        if (!isMatch) return new ServerResponse(401, 'Invalid credentials');

        // trigger password reset
        if (
            (foundUser.resetPwd ||
                foundUser.lastLoginTime === null ||
                !foundUser.emailVerified) &&
            !foundUser.active
        ) {
            return {
                message: 'Password reset triggered',
                data: _.omit(foundUser._doc, [
                    'password',
                    'otp',
                    'refreshTokens',
                ]),
            };
        }

        // user is not active
        if (foundUser.emailVerified && !foundUser.active)
            return new ServerResponse(
                403,
                'Account inactive. Contact your tech support'
            );

        const accessToken = foundUser.generateAccessToken();
        const newRefreshToken = foundUser.generateRefreshToken();

        if (cookies?.jwt) {
            // If found jwt cookie, del from db
            foundUser.refreshTokens = foundUser.refreshTokens.filter(
                (rt) => rt.token !== cookies.jwt && Date.now() < rt.exp
            );

            // check for refresh token reuse
            const foundToken = await User.findOne(
                {
                    refreshTokens: { $elemMatch: { token: cookies.jwt } },
                },
                { password: 0 }
            );
            if (!foundToken) {
                // refresh token reuse detected, delete all refresh tokens.
                console.log('clearing tokens');
                foundUser.refreshTokens = [];
                await foundUser.save();
            }

            // TODO: uncomment secure
            // clear all cookies
            res.clearCookie('jwt', {
                httpOnly: true,
                sameSite: 'None',
                secure: config.get('secure_cookie'),
            });
        }

        foundUser.refreshTokens.push(newRefreshToken);
        foundUser.set({
            lastLoginTime: new Date(),
        });
        await foundUser.save();

        const expires = parseInt(config.get('jwt.expTime.refresh')) * 1_000; // convert to milliseconds
        // TODO: uncomment secure in prod
        res.cookie('jwt', newRefreshToken.token, {
            httpOnly: true,
            sameSite: 'None',
            secure: config.get('secure_cookie'),
            maxAge: expires,
        });
        
        return {
            message: 'Login success.',
            data: {
                user: _.omit(foundUser._doc, [
                    'password',
                    'otp',
                    'refreshTokens',
                ]),
                accessToken,
            },
        };
    } catch (exception) {
        logger.error({
            method: 'login',
            message: exception.message,
            meta: exception.stack,
        });
        debug(exception);
        return new ServerResponse(500, 'Something went wrong');
    }
}

async function logout(cookies, res) {
    try {
        if (!cookies?.jwt) return new ServerResponse(204);
        const refreshToken = cookies.jwt;

        const foundUser = await User.findOne(
            { refreshTokens: { $elemMatch: { token: refreshToken } } },
            { password: 0, otp: 0 }
        );
        if (!foundUser) {
            // cookie found but does not match any user
            // TODO: uncomment secure
            res.clearCookie('jwt', {
                httpOnly: true,
                sameSite: 'None',
                secure: config.get('secure_cookie'),
            });

            debug('no user found to logout');
            return new ServerResponse(204);
        }

        // deleting refresh token from user refresh tokens on db
        foundUser.refreshTokens = foundUser.refreshTokens.filter(
            (rt) => rt.token !== refreshToken && Date.now() < rt.exp
        );
        await foundUser.save();

        // TODO: uncomment secure
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: 'None',
            secure: config.get('secure_cookie'),
        });

        debug('logged out');
        return {
            message: 'logged out',
        };
    } catch (exception) {
        logger.error({
            method: 'logout',
            message: exception.message,
            meta: exception.stack,
        });
        debug(exception);
        return new ServerResponse(500, 'Something went wrong');
    }
}

async function verifySignUp(
    email,
    currentPassword,
    newPassword,
    otp,
    cookies,
    res
) {
    try {
        const foundUser = await User.findOne({ email });
        if (!foundUser) return new ServerResponse(401, 'Invalid credentials');
        if (!foundUser.resetPwd) return new ServerResponse(409, 'Account has been activated');

        const isMatch = await bcrypt.compare(
            currentPassword,
            foundUser.password
        );
        if (!isMatch) return new ServerResponse(401, 'Invalid credentials');

        // otp expired or incorrect
        if (Date.now() > foundUser.otp.exp || otp !== foundUser.otp.OTP)
            return new ServerResponse(401, 'Invalid OTP');

        const percentageSimilarity =
            similarity(newPassword, currentPassword) * 100;
        const similarityThreshold = parseInt(config.get('max_similarity'));
        if (percentageSimilarity >= similarityThreshold)
            return new ServerResponse(
                400,
                'Password is too similar to old password.'
            );

        const accessToken = foundUser.generateAccessToken();
        const newRefreshToken = foundUser.generateRefreshToken();

        if (cookies?.jwt) {
            // If found jwt cookie, del from db to reissue a new refresh token
            foundUser.refreshTokens = foundUser.refreshTokens.filter(
                (rt) => rt.token !== cookies.jwt && Date.now() < rt.exp
            );
            // TODO: uncomment secure
            res.clearCookie('jwt', {
                httpOnly: true,
                sameSite: 'None',
                secure: config.get('secure_cookie'),
            });
        }

        foundUser.refreshTokens.push(newRefreshToken);
        foundUser.set({
            emailVerified: true,
            password: newPassword,
            'otp.OTP': null,
            'otp.exp': null,
            active: true,
            resetPwd: false,
            lastLoginTime: new Date(),
        });
        await foundUser.save();

        const expires = parseInt(config.get('jwt.expTime.refresh')) * 1_000; // convert to milliseconds
        // TODO: uncomment secure in prod
        res.cookie('jwt', newRefreshToken.token, {
            httpOnly: true,
            sameSite: 'None',
            secure: config.get('secure_cookie'),
            maxAge: expires,
        });

        return {
            message: 'Email verified and account activated',
            new: false,
            data: {
                user: _.omit(foundUser._doc, [
                    'password',
                    'otp',
                    'refreshTokens',
                ]),
                accessToken,
            },
        };
    } catch (exception) {
        logger.error({
            method: 'verify_sign_up',
            message: exception.message,
            meta: exception.stack,
        });
        debug(exception);
        return { errorCode: 500, message: 'Something went wrong.' };
    }
}

async function signOutAllDevices(id, cookies, res) {
    try {
        if (!cookies?.jwt) return new ServerResponse(204);
        const refreshToken = cookies.jwt;

        const foundUser = await User.findOne(
            { refreshTokens: { $elemMatch: { token: refreshToken } } },
            { password: 0, otp: 0 }
        );
        if (!foundUser) {
            // TODO: uncomment secure
            res.clearCookie('jwt', {
                httpOnly: true,
                sameSite: 'None',
                secure: config.get('secure_cookie'),
            });

            debug('no user found to logout');
            return new ServerResponse(204);
        }

        // deleting refresh token from user refresh tokens on db
        foundUser.refreshTokens = foundUser.refreshTokens.filter(
            (rt) => rt.token !== refreshToken && Date.now() < rt.exp
        );
        await foundUser.save();

        // TODO: uncomment secure
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: 'None',
            secure: config.get('secure_cookie'),
        });

        debug('logged out');
        return {
            message: 'logged out',
        };
    } catch (exception) {
        logger.error({
            method: 'sign_out_all_devices',
            message: exception.message,
            meta: exception.stack,
        });
        debug(exception);
        return new ServerResponse(500, 'Something went wrong');
    }
}

module.exports = {
    login,
    logout,
    verifySignUp,
    signOutAllDevices,
};

const _ = require('lodash');
const bcrypt = require('bcrypt');
const config = require('config');
const debug = require('debug')('app:authCtrl');
const Lender = require('../models/lender');
const logger = require('../utils/logger')('authCtrl.js');
const ServerError = require('../errors/serverError');
const User = require('../models/user');

async function login(type, email, password, cookies, res) {
    try {
        if (type === 'lenders') {
            var foundUser = await Lender.findOne({ email });
        } else {
            // type is equal to users
            var foundUser = await User.findOne({ email });
        }
        if (!foundUser) return new ServerError(401, 'Invalid credentials');

        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) return new ServerError(401, 'Invalid credentials');

        if (
            (foundUser.lastLoginTime === null || !foundUser.emailVerified) &&
            !foundUser.active
        ) {
            // new unverified user
            return {
                message: 'success',
                new: true,
                data: _.omit(foundUser._doc, [
                    'password',
                    'otp',
                    'refreshTokens',
                ]),
            };
        }

        if (foundUser.emailVerified && !foundUser.active)
            return new ServerError(
                403,
                'Account inactive. Contact your tech support'
            );

        const accessToken = foundUser.generateAccessToken();
        const newRefreshToken = foundUser.generateRefreshToken();

        if (cookies?.jwt) {
            // If found jwt cookie, del from db and clear cookie.
            foundUser.refreshTokens = foundUser.refreshTokens.filter(
                (rt) => rt.token !== cookies.jwt && Date.now() < rt.exp
            );
            // TODO: uncomment secure
            res.clearCookie('jwt', {
                httpOnly: true,
                sameSite: 'None',
                // secure: true,
            });
        }

        await foundUser.updateOne({
            lastLoginTime: new Date(),
            $push: { refreshTokens: newRefreshToken },
        });

        const expires = parseInt(config.get('jwt.refresh_time')) * 1_000; // convert to milliseconds
        // TODO: uncomment secure in prod
        res.cookie('jwt', newRefreshToken.token, {
            httpOnly: true,
            sameSite: 'None',
            // secure: true,
            maxAge: expires,
        });

        return {
            message: 'Login success.',
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
            method: 'login',
            message: exception.message,
            meta: exception.stack,
        });
        debug(exception);
        return new ServerError(500, 'Something went wrong');
    }
}

async function logout(type, cookies, res) {
    try {
        if (!cookies?.jwt) return new ServerError(204);
        const refreshToken = cookies.jwt;

        if (type === 'lenders')
            var foundUser = await Lender.findOne(
                { refreshTokens: refreshToken },
                { password: 0, otp: 0 }
            );
        else
            var foundUser = await User.findOne(
                { refreshTokens: refreshToken },
                { password: 0, otp: 0 }
            );

        if (!foundUser) {
            // TODO: uncomment secure
            res.clearCookie('jwt', {
                httpOnly: true,
                sameSite: 'None',
                // secure: true,
            });

            return new ServerError(204);
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
            // secure: true,
        });

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
        return new ServerError(500, 'Something went wrong');
    }
}

async function verifySignUp(type, email, password, otp, cookie) {
    try {
        if (type === 'lenders') {
            var foundUser = await Lender.findOne({ email });
        } else {
            // type is equal to users
            var foundUser = await User.findOne({ email });
        }
        if (!foundUser) return new ServerError(401, 'Invalid credentials');

        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) return new ServerError(401, 'Invalid credentials');

        if (foundUser.emailVerified)
            return new ServerError(409, 'Account has already been verified');

        if (Date.now() > foundUser.otp.expires || otp !== foundUser.otp.OTP) {
            // OTP not valid or expired.
            return new ServerError(401, 'Invalid OTP');
        }

        const accessToken = foundUser.generateAccessToken();
        const newRefreshToken = foundUser.generateRefreshToken();

        if (cookies?.jwt) {
            // If found jwt cookie, del from db and clear cookie.
            foundUser.refreshTokens = foundUser.refreshTokens.filter(
                (rt) => rt.token !== cookies.jwt && Date.now() < rt.exp
            );
            // TODO: uncomment secure
            res.clearCookie('jwt', {
                httpOnly: true,
                sameSite: 'None',
                // secure: true,
            });
        }

        await foundUser.updateOne({
            emailVerified: true,
            'otp.OTP': null,
            active: true,
            lastLoginTime: new Date(),
            $push: { refreshTokens: newRefreshToken },
        });

        const expires = parseInt(config.get('jwt.refresh_time')) * 1_000; // convert to milliseconds
        // TODO: uncomment secure in prod
        res.cookie('jwt', newRefreshToken.token, {
            httpOnly: true,
            sameSite: 'None',
            // secure: true,
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
            method: 'verifySignUp',
            message: exception.message,
            meta: exception.stack,
        });
        debug(exception);
        return { errorCode: 500, message: 'Something went wrong.' };
    }
}

module.exports = {
    login,
    logout,
    verifySignUp,
};

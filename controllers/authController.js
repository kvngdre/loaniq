const Lender = require('../models/lender');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger')('authCtrl.js');
const debug = require('debug')('app:authCtrl');
const _ = require('lodash');
const ServerError = require('../errors/serverError');

async function login(type, email, password, res) {
    try {
        if (type === 'lenders') {
            var foundUser = await Lender.findOne({ email });
        } else {
            var foundUser = await User.findOne({ email });
        }
        if (!foundUser) return new ServerError(401, 'Invalid credentials');

        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) return new ServerError(401, 'Invalid credentials');

        if (
            (foundUser.lastLoginTime === null || !foundUser.emailVerified) &&
            !foundUser.active
        ) {
            return {
                message: 'success',
                new: true,
                data: _.omit(foundUser._doc, ['password', 'otp']),
            };
        }

        if (foundUser.emailVerified && !foundUser.active)
            return new ServerError(
                403,
                'Account inactive. Contact your tech support'
            );

        const accessToken = foundUser.generateAccessToken();
        const refreshToken = await foundUser.generateRefreshToken();

        await foundUser.updateOne({
            lastLoginTime: new Date(),
            $push: { refreshToken: refreshToken },
        });

        const expires = parseInt(config.get('jwt.refresh_time')) * 1_000; // convert to milliseconds
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: expires });
        const currentUser = {
            ..._.omit(foundUser._doc, ['password', 'otp', 'refreshTokens']),
            accessToken,
        };

        return {
            message: 'Login success.',
            new: false,
            data: currentUser,
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
            const expires = parseInt(config.get('jwt.refresh_time')) * 1_000; // convert to milliseconds
            res.clearCookie('jwt', { httpOnly: true, maxAge: expires });

            return new ServerError(204);
        }

        // deleting refresh token from user refresh tokens
        const index = foundUser.refreshTokens.findIndex(token => token === refreshToken);
        foundUser.refreshTokens.splice(index, 1);

        await foundUser.save();

        // TODO: add the secure: true to cookie options in prod. only serves on https
        const expires = parseInt(config.get('jwt.refresh_time')) * 1_000; // convert to milliseconds
        res.clearCookie('jwt', { httpOnly: true, maxAge: expires });

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

module.exports = {
    login,
    logout,
};

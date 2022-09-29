const config = require('config');
const debug = require('debug')('app:refreshTokenCtrl');
const jwt = require('jsonwebtoken');
const Lender = require('../models/lender');
const logger = require('../utils/logger')('refreshTokenCtrl.js');
const ServerError = require('../errors/serverError');
const User = require('../models/user');

async function handleRefreshToken(type, cookies, res) {
    try {
        if (!cookies?.jwt) return new ServerError(401, 'No token provided');
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

        if (!foundUser) return new ServerError(403, 'Forbidden');

        const decoded = jwt.verify(
            refreshToken,
            config.get('jwt.secret.refresh')
        );
        if (
            decoded.id != foundUser._id ||
            decoded.iss !== config.get('jwt.issuer') ||
            decoded.aud !== config.get('jwt.audience')
        ) {
            return new ServerError(403, 'Invalid token');
        }

        const accessToken = foundUser.generateAccessToken();
        return {
            message: 'success',
            data: { accessToken },
        };
    } catch (exception) {
        logger.error({
            method: 'refreshTokenCtrl',
            message: exception.message,
            meta: exception.stack,
        });
        debug(exception);
        return new ServerError(403, 'Invalid token provided');
    }
}

module.exports = {
    handleRefreshToken,
};

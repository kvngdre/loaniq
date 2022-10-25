const config = require('config');
const debug = require('debug')('app:refreshTokenCtrl');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger')('refreshTokenCtrl.js');
const ServerError = require('../errors/serverError');
const User = require('../models/userModel');

async function handleRefreshToken(cookies, res) {
    try {
        if (!cookies?.jwt) return new ServerError(401, 'No token provided');
        const refreshToken = cookies.jwt;
        // TODO: uncomment secure
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: 'None',
            secure: config.get('secure_cookie'),
        });

        const foundUser = await User.findOne(
            { refreshTokens: { $elemMatch: { token: refreshToken } } },
            { password: 0, otp: 0 }
        );

        // Token not found. Detected refresh token re-use!
        if (!foundUser) {
            const decoded = jwt.verify(
                refreshToken,
                config.get('jwt.secret.refresh')
            );
            const hackedUser = await User.findOne(
                { _id: decoded.id },
                { password: 0, otp: 0 }
            ).exec();

            hackedUser.refreshTokens = [];
            await hackedUser.save();

            return new ServerError(403, 'Forbidden');
        }

        foundUser.refreshTokens = foundUser.refreshTokens.filter(
            (rt) => rt.token !== refreshToken && Date.now() < rt.exp
        );
        await foundUser.save();

        const decoded = jwt.verify(
            refreshToken,
            config.get('jwt.secret.refresh')
        );
        if (
            decoded.id != foundUser._id.toString() ||
            decoded.iss !== config.get('jwt.issuer') ||
            decoded.aud !== config.get('jwt.audience.token')
        ) {
            // Not right token or token has been tampered with.
            return new ServerError(403, 'Invalid token');
        }

        // Generate tokens
        const newAccessToken = foundUser.generateAccessToken();
        const newRefreshToken = foundUser.generateRefreshToken();

        await foundUser.updateOne({
            $push: { refreshTokens: newRefreshToken },
        });

        const expires = parseInt(config.get('jwt.expTime.refresh')) * 1_000; // convert to milliseconds
        // TODO: uncomment secure
        res.cookie('jwt', newRefreshToken.token, {
            httpOnly: true,
            sameSite: 'None',
            secure: config.get('secure_cookie'),
            maxAge: expires,
        });

        return {
            message: 'New token generated',
            data: { accessToken: newAccessToken },
        };
    } catch (exception) {
        logger.error({
            method: 'refresh_token_ctrl',
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

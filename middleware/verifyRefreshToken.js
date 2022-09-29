const config = require('config');
const debug = require('debug')('app:verifyRefreshToken');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger')('verifyRefreshToken.js');

async function verifyRefreshToken(req, res, next) {
    try {
        const refreshToken = req.body.token;
        if (refreshToken === null || refreshToken === undefined)
            return res.status(401).send('Invalid request. No token provided.');

        const decoded = jwt.verify(
            refreshToken,
            config.get('jwt.secret.refresh')
        );
        
        if (
            decoded.iss !== config.get('jwt.issuer') ||
            decoded.aud !== config.get('jwt.audience')
        )
            return res.status(403).send('Invalid token.');


        next();
    } catch (exception) {
        logger.error({
            method: 'verifyRefreshToken',
            message: exception.message,
            meta: exception.stack,
        });
        debug(exception);
        return res.status(403).send('Invalid token provided.');
    }
}

module.exports = verifyRefreshToken;

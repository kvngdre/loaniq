const config = require('config');
const jwt = require('jsonwebtoken');
const debug = require('debug')('app:verifyToken');
const logger = require('../utils/logger')('verifyToken.js');

function verifyToken(req, res, next) {
    try {
        const token = req.header('auth-token') || req.header('Authorization');

        if (!token)
            return res.status(401).send('Access Denied. No token provided.');

        const isVerified = jwt.verify(token, config.get('jwt_secret'));

        req.user = isVerified;

        next();
    } catch (exception) {
        logger.error({ message: exception.message, meta: exception.stack });
        debug(exception.message);
        return res.status(403).send('Invalid token provided.');
    }
}

module.exports = verifyToken;

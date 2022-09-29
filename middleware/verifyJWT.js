const config = require('config');
const debug = require('debug')('app:verifyJWT');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger')('verifyJWT.js');

function verifyToken(req, res, next) {
    try {
        // const token = req.header('auth-token') || req.header('Authorization')
        const authHeader = req.header('auth-token') || req.header('Authorization')
        if(!authHeader) return res.sendStatus(401);
        const [scheme, token] = authHeader.split(' ');
        
        if(scheme !== 'Bearer') return res.sendStatus(401);

        if (!token)
            return res.status(401).send('Access Denied. No token provided.');

        const decoded = jwt.verify(token, config.get('jwt.secret.access'));

        req.user = decoded;

        next();
    } catch (exception) {
        logger.error({method: 'verifyToken', message: exception.message, meta: exception.stack });
        debug(exception.message);
        return res.status(403).send('Invalid token provided.');
    }
}

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

module.exports = {
    verifyToken,
    verifyRefreshToken
}
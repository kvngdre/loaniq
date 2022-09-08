const config = require('config');
const jwt = require('jsonwebtoken');
const debug = require('debug')('app:verifyToken');

function verifyToken(req, res, next) {
    try {
        const token = req.header('auth-token') || req.header('Authorization');

        if (!token)
            return res.status(401).send('Access Denied. No token provided');

        // if(token === 'guestUser') {
        //     req.user = {role: 'guest'};

        //     return next();
        // };

        const isVerified = jwt.verify(token, config.get('jwt_secret'));

        req.user = isVerified;

        next();
    } catch (exception) {
        debug(exception.message);
        return res.status(403).send('Invalid token provided');
    }
}

module.exports = verifyToken;

const config = require('config');
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    try{
        const token = req.header('auth-token');
        if(!token) return res.status(401).send('Access Denied. No token provided.');

        const isVerified = jwt.verify(token, config.get('jwtPrivateKey'));
        req.user = isVerified;

        next();

    }catch (exception) {
        return exception;
    };
}

module.exports = verifyToken;

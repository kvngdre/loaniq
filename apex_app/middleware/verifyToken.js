const config = require('config');
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    try{
        const token = req.header('auth-token');
        if(!token) return res.status(403).send('Access Denied. No token provided.');

        const isVerified = jwt.verify(token, 'mySecureKey');
        req.user = isVerified;

        next();

    }catch (exception) {
        return res.status(400).send('Invalid Token provided.');
    };
}

module.exports = verifyToken;

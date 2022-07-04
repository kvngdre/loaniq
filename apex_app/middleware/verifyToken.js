const jwt = require('jsonwebtoken');
const debug = require('debug')('verifyToken');


function verifyToken(req, res, next) {
    try{
        const token = req.header("auth-token") || req.header("Authorization");

        if(!token) return res.status(403).send('Access Denied. No token provided.');

        if(token === 'guestUser') {
            req.user = {role: 'guest'};

            return next();
        };
    
        const isVerified = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        // if(!isVerified.active) 
        req.user = isVerified;

        next();

    }catch(exception) {
        debug(exception.message);
        return res.status(400).send('Invalid token provided');
    };
}

module.exports = verifyToken;
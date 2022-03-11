const debug = require('debug')('app:errorHandler');

function errorHandler(err, req, res, next) {
    debug(err.message, err.stack);
    res.status(500).send('Internal Server Error');
}

module.exports = errorHandler;

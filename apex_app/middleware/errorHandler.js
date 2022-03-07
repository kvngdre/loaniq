const debug = require('debug')('app:errorHandler');

function errorHandler(err, req, res, next) {
    debug(err.message);
    res.status(500).send('Internal Server Error')
}

module.exports = errorHandler;

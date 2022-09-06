const { MulterError } = require('multer');
const debug = require('debug')('app:errorHandler');
const { FileUploadError } = require('../errors/fileUploadError');

function errorHandler(err, req, res, next) {
    // Catch errors in request JSON.
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        debug(err.message);
        return res.status(400).send('Error in request JSON.');
    }

    if (err.name === 'FileUploadError') {
        debug(err);
        return res.status(err.statusCode).send(err.message);
    }

    console.log(err.message, err.stack);
    res.status(500).send('Internal Server Error.');

    next();
}

module.exports = errorHandler;

const debug = require('debug')('app:errorHandler');
const { MulterError } = require('multer');
const { FileUploadError } = require('../Errors/fileUploadError');


function errorHandler(err, req, res, next) {
    // Catch errors for bad json format.
    console.log('knkfl[======', err.stack);
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        debug(err.message);
        return res.status(400).send(`Error in JSON object: ${err.message}`);
    };
    
    if(err instanceof FileUploadError || err instanceof MulterError) {
        debug(err.message, err?.stack);
        return res.status(err?.statusCode || 400).send(`Error: ${err?.message || err.code}`);
    };

    debug(err.message, err.stack);
    res.status(500).send('Internal Server Error');

    next();
}

module.exports = errorHandler;
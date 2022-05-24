const debug = require('debug')('app:errorHandler');
const { MulterError } = require('multer');
const { FileUploadError } = require('../Errors/fileUploadError');

function errorHandler(err, req, res, next) {
<<<<<<< HEAD
  // Catch errors for bad json format.
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    debug(err.message);
    return res.status(400).send(`Error in JSON object: ${err.message}.`);
  }
=======
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
>>>>>>> 8e6a78a6795d3332c4a33f3b9be71be9d2fe75b9

  console.log(err.message, err.stack);
  res.status(500).send('Internal Server Error');

  next();
}

module.exports = errorHandler;

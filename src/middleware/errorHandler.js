import { MulterError } from 'multer'
import FileUploadError from '../errors/fileUploadError'
const debug = require('debug')('app:errorHandler')

function errorHandler (err, req, res, next) {
  // Catch errors in request JSON.
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    debug(err.message)
    return res
      .status(400)
      .json({ success: false, message: 'Error in request JSON' })
  }

  if (err instanceof MulterError || err instanceof FileUploadError) {
    debug(err)
    return res.status(400).json(err.message)
  }

  debug(err)
  res.status(500).json({ success: false, message: 'Internal Server Error' })

  next()
}

export default errorHandler

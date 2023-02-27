import { httpCodes } from '../utils/constants'
import ErrorHandler from '../errors/ErrorHandler'

class ErrorResponse {
  constructor (err) {
    this.success = false
    this.name = err.name
    this.errors = err.path
      ? { [err.path]: err.message }
      : { message: err.message }
    this.data = err?.data
  }
}

export default (err, req, res, next) => {
  // Catch errors for bad req json.
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(httpCodes.BAD_REQUEST).json({
      success: false,
      error: { message: 'Error in request JSON.' }
    })
  }

  ErrorHandler.handleError(err)

  if (ErrorHandler.isTrustedError(err)) {
    return res.status(err.code).json(new ErrorResponse(err))
  }

  return res.status(httpCodes.INTERNAL_SERVER).json(
    new ErrorResponse({
      name: 'Server Error',
      message: 'Something went wrong.'
    })
  )
}

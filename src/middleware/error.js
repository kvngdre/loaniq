import { httpCodes } from '../utils/constants'
import ErrorHandler from '../utils/ErrorHandler'
import ErrorResponse from '../utils/ErrorResponse'

export default (err, _req, res, _next) => {
  // Catch errors for bad req json.
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(httpCodes.BAD_REQUEST).json(
      new ErrorResponse({
        name: 'Bad Request Error',
        message: 'Error in request JSON.'
      })
    )
  }

  ErrorHandler.handleError(err)

  if (ErrorHandler.isTrustedError(err)) {
    return res.status(err.code).json(new ErrorResponse(err))
  }

  // return res.status(httpCodes.INTERNAL_SERVER).json(
  //   new ErrorResponse({
  //     name: 'Server Error',
  //     message: 'Something went wrong.'
  //   })
  // )
}

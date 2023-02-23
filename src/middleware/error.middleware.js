import { httpCodes } from '../utils/constants'
import { handleError, isTrustedError } from '../errors/ErrorHandler'

class ErrorResponse {
  constructor (description) {
    this.success = false
    this.error = {
      message: description
    }
  }
}

export default (err, req, res, next) => {
  handleError(err)

  if (isTrustedError(err)) { return res.status(err.code).json(new ErrorResponse(err.message)) }

  return res
    .status(httpCodes.INTERNAL_SERVER)
    .json(new ErrorResponse('Internal Server Error'))
}

class ServerError extends Error {
  constructor(code, msg) {
    super()

    this.errorCode = code
    this.message = msg
    this.name = this.constructor.name
    Error?.captureStackTrace(this, this.constructor)
  }
}

export default ServerError

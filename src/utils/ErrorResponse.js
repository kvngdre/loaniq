class ErrorResponse {
  constructor (err) {
    this.success = false
    this.name = err.name
    this.errors = err?.errors ? { ...err.errors } : { message: err.message }
    this.data = err?.data
  }
}

export default ErrorResponse

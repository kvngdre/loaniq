class ServerResponse {
  #name
  #code
  #message
  #data

  /**
     *
     * @param {number} code - The HTTP status code
     * @param {string} message - The response message
     * @param {(Object|Array)} [data] - The response data if any.
     */
  constructor (code, message, data = undefined) {
    this.#code = code
    this.#message = message
    this.#data = data
    this.#name = this.constructor.name
  }

  get code () {
    return this.#code
  }

  get payload () {
    return {
      success: !(this.#code >= 400),
      message: this.#message,
      data: this.#data
    }
  }
}

export default ServerResponse

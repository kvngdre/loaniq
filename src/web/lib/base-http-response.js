export class BaseHttpResponse {
  constructor(message, data, error) {
    this.message = message;
    this.data = data;
    this.error = error;
  }

  static success(message, data = undefined) {
    return new BaseHttpResponse(message, data, undefined);
  }

  static failed(message, error = undefined) {
    return new BaseHttpResponse(message, undefined, this.#refineError(error));
  }

  static #refineError(error) {
    const details = [{ message: "", path: "" }];
    const keys = Object.keys(error);

    for (let i = 0; i < keys.length; i += 1) {
      // const message = !(error[key[i]]) ?
      details[i] = { message: error[keys[i]], path: keys[i] };
    }

    return {
      details,
    };
  }
}

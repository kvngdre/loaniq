export class BaseHttpResponse {
  constructor(message, data, errors) {
    this.message = message;
    this.data = data;
    this.errors = errors;
  }

  static success(message, data = undefined) {
    return new BaseHttpResponse(message, data, undefined);
  }

  static failed(message, errors = undefined) {
    return new BaseHttpResponse(message, undefined, errors);
  }
}

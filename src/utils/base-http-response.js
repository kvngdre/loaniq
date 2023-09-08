export class BaseHttpResponse {
  constructor(message, errors, data) {
    this.message = message;
    this.errors = errors;
    this.data = data;
  }

  static success(message, data) {
    return new BaseHttpResponse(message, undefined, data);
  }

  static failed(message, errors) {
    return new BaseHttpResponse(message, errors, undefined);
  }
}

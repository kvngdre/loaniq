export class BaseHttpResponse {
  constructor(message, error, data) {
    this.message = message;
    this.error = error;
    this.data = data;
  }

  static success(message, data) {
    return new BaseHttpResponse(message, undefined, data);
  }

  static failure(message, errors) {
    return new BaseHttpResponse(message, errors, undefined);
  }
}

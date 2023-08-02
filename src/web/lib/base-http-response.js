export class BaseHttpResponse {
  constructor(data, error, statusCode) {
    this.data = data;
    this.error = error;
    this.statusCode = statusCode;
  }

  static success(data, statusCode) {
    return new BaseHttpResponse(data, null, statusCode);
  }

  static failed(error, statusCode) {
    return new BaseHttpResponse(null, error, statusCode);
  }
}

export class ValidateRequestMiddleware {
  constructor(dto, withParams = false) {
    this.dto = dto;
    this.withParams = withParams;
  }

  execute(req, res, next) {
    if (this.withParams) {
      req.body = {
        ...req.body,
        ...req.params,
      };
    }
    req.body = this.dto.from(req.body);

    next();
  }

  static with(dto) {
    return new ValidateRequestMiddleware(dto, false).execute;
  }

  static withParams(dto) {
    return new ValidateRequestMiddleware(dto, true).execute;
  }
}

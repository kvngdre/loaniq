export class ValidateRequestMiddleware {
  constructor(dto, withParams = false) {
    this.dtoClass = dto;
    this.withParams = withParams;
    this.execute = this.execute.bind(this);
  }

  execute(req, res, next) {
    if (this.withParams) {
      req.body = {
        ...req.body,
        ...req.params,
      };
    }
    req.body = this.dtoClass.from(req.body);

    next();
  }

  static with(dto) {
    return new ValidateRequestMiddleware(dto, false).execute;
  }

  static withParams(dto) {
    return new ValidateRequestMiddleware(dto, true).execute;
  }
}

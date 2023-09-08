import { ValidationError } from "../../utils/errors/index.js";

export class ValidateRequest {
  /**
   *
   * @param {import("joi").ObjectSchema} schema
   * @param {boolean} withParams
   */
  constructor(schema) {
    this.schema = schema;
    this.execute = this.execute.bind(this);
  }

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  execute(req, res, next) {
    const { value, error } = this.schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (error) {
      const err = this.#refineError(error);
      throw new ValidationError("Validation error occurred", err);
    }

    req.body = value.body || req.body;
    req.params = value.params || req.params;
    req.query = value.query || req.query;

    next();
  }

  static with(schema) {
    return new ValidateRequest(schema).execute;
  }

  #formatErrorMessage(message) {
    // Regex to locate the appropriate space for inserting
    // commas in numbers in thousands or millions.
    const regex = /(?<!.*ISO \d)\B(?=(\d{3})+(?!\d))/g;

    // Remove quotation marks.
    let formattedMessage = `${message.replaceAll('"', "")}.`;

    // Insert comma to number if a number is present in the error message.
    formattedMessage = formattedMessage.replace(regex, ",");

    return formattedMessage;
  }

  #refineError(error) {
    const reducer = (previousValue, currentValue) => {
      if (previousValue === "") return previousValue + currentValue;
      return `${previousValue}.${currentValue}`;
    };

    const err = {};

    for (let i = 0; i < error.details.length; i += 1) {
      const key = error.details[i].path.reduce(reducer, "");
      const message = this.#formatErrorMessage(error.details[i].message);

      err[key] = message;
    }

    return err;
  }
}

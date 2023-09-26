import { EmailTemplateService } from "../../logic/services/index.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";

export class EmailTemplateController {
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  static index = async (req, res) => {
    const { message, data } = await EmailTemplateService.all();
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  static create = async (req, res) => {
    const { message, data } = await EmailTemplateService.create(req.body);
    const response = BaseHttpResponse.success(message, data);

    res.status(201).json(response);
  };

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  static show = async (req, res) => {
    const { message, data } = await EmailTemplateService.get(req.params.id);
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  static edit = async (req, res) => {
    const { message, data } = await EmailTemplateService.update(
      req.params.id,
      req.body,
    );
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  static destroy = async (req, res) => {
    const { message, data } = await EmailTemplateService.delete(req.params.id);
    const response = BaseHttpResponse.success(message, data);

    res.status(204).json(response);
  };
}

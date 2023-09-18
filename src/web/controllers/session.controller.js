import { SessionService } from "../../logic/services/index.js";
import { messages } from "../../utils/index.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";

export class SessionController {
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static index = async (req, res) => {
    const sessions = await SessionService.all();
    const response = BaseHttpResponse.success(
      messages.COMMON.FETCHED_Fn("Sessions"),
      sessions,
    );

    res.json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static create = async (req, res) => {
    const session = await SessionService.create(req.body);
    const response = BaseHttpResponse.success(
      messages.COMMON.CREATED_Fn("Session"),
      session,
    );

    res.status(201).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static show = async (req, res) => {
    const session = await SessionService.get(req.params.id);
    const response = BaseHttpResponse.success(
      messages.COMMON.FETCHED_Fn("Session"),
      session,
    );

    res.json(response);
  };

  static edit = async (req, res) => {
    const session = await SessionService.update(req.params.id, req.body);
    const response = BaseHttpResponse.success(
      messages.COMMON.UPDATED_Fn("Session"),
      session,
    );

    res.json(response);
  };

  static destroy = async (req, res) => {
    await SessionService.update(req.params.id, req.body);
    const response = BaseHttpResponse.success(
      messages.COMMON.DELETED_Fn("Session"),
    );

    res.status(204).json(response);
  };
}

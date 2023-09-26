import { UserService } from "../../logic/services/index.js";
import { messages } from "../../utils/messages.utils.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";

export class UserController {
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static index = async (req, res) => {
    const { message, data } = await UserService.all();
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static create = async (req, res) => {
    const { message, data } = await UserService.create(
      req.body,
      req.user.tenantId,
    );
    const response = BaseHttpResponse.success(message, data);

    res.status(201).json(response);
  };

  static show = async (req, res) => {
    const { message, data } = await UserService.get(req.params.userId);
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  static showCurrentUser = async (req, res) => {
    const { message, data } = await UserService.get(req.user._id);
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  static edit = async (req, res) => {
    const { message, data } = await UserService.update(req.params.id, req.body);
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  static destroy = async (req, res) => {
    await UserService.delete(req.params.id);
    const response = BaseHttpResponse.success(
      messages.COMMON.DELETED_Fn("User"),
    );

    res.status(204).json(response);
  };

  static changePassword = async (req, res) => {
    const { message, data } = await UserService.changePassword(
      req.user._id,
      req.body,
    );
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  static resetPassword = async (req, res) => {
    const { message, data } = await UserService.resetPassword(req.params.id);
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  static deactivate = async (req, res) => {
    const { message, data } = await UserService.deactivateUser(
      req.params.id,
      req.user._id,
    );
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  static reactivate = async (req, res) => {
    const { message, data } = await UserService.reactivateUser(req.params.id);
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };
}

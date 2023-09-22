import { UserService } from "../../logic/services/index.js";
import { HttpCode } from "../../utils/common.js";
import { ValidationError } from "../../utils/errors/index.js";
import { messages } from "../../utils/messages.utils.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";
import userValidator from "../validators/user.validator.js";
import BaseController from "./base.controller.js";

export class UserController extends BaseController {
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
    const user = await UserService.getUserById(req.params.userId);
    const response = this.apiResponse("Fetched user", user);

    res.status(HttpCode.OK).json(response);
  };

  static getCurrentUser = async (req, res) => {
    const user = await UserService.getCurrentUser(req.currentUser._id);
    const response = this.apiResponse("Fetched current user", user);

    res.status(HttpCode.OK).json(response);
  };

  static edit = async (req, res) => {
    const { value, error } = userValidator.validateUpdate(req.body);
    if (error) throw new ValidationError(null, error);

    const user = await UserService.updateUser(req.params.userId, value);
    const response = this.apiResponse("User account update", user);

    res.status(HttpCode.OK).json(response);
  };

  static destroy = async (req, res) => {
    await UserService.delete(req.params.id);
    const response = BaseHttpResponse.success(
      messages.COMMON.DELETED_Fn("User"),
    );

    res.status(204).json(response);
  };

  static changePassword = async (req, res) => {
    const { value, error } = userValidator.validateUpdatePassword(req.body);
    if (error) throw new ValidationError(null, error);

    await UserService.changePassword(req.params.userId, value);
    const response = this.apiResponse("Password updated");

    res.status(HttpCode.OK).json(response);
  };

  static resetPassword = async (req, res) => {
    await UserService.resetPassword(req.params.userId);
    const response = this.apiResponse("User password has been reset.");

    res.status(HttpCode.OK).json(response);
  };

  static deactivateUser = async (req, res) => {
    const { value, error } = userValidator.validateDeactivation(req.body);
    if (error) throw new ValidationError(null, error);

    await UserService.deactivateUser(req.params.userId, value);
    const response = this.apiResponse("User deactivated");

    res.status(HttpCode.OK).json(response);
  };

  static reactivateUser = async (req, res) => {
    await UserService.reactivateUser(req.params.userId);
    const response = this.apiResponse("User has been reactivated");

    res.status(HttpCode.OK).json(response);
  };

  static uploadFiles = async (req, res) => {
    const user = await UserService.uploadImage(req.params, req.file);
    const response = this.apiResponse("File uploaded", user);

    res.status(HttpCode.OK).json(response);
  };
}

export default UserController;

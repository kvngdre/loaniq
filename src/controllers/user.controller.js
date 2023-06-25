import requestIp from 'request-ip';
import { constants } from '../config/index.js';
import { ValidationError } from '../errors/index.js';
import UserService from '../services/user.service.js';
import { HttpCode } from '../utils/common.js';
import userValidator from '../validators/user.validator.js';
import BaseController from './base.controller.js';

class UserController extends BaseController {
  static createUser = async (req, res) => {
    const { value, error } = userValidator.validateCreateUser(
      req.body,
      req.currentUser.tenantId,
    );
    if (error) throw new ValidationError(null, error);

    const newUser = await UserService.createUser(value);
    const response = this.apiResponse(
      'User created. Temporary password sent to user email',
      newUser,
    );

    res.status(HttpCode.CREATED).json(response);
  };

  static verifySignup = async (req, res) => {
    const { value, error } = userValidator.validateVerifySignUp(req.body);
    if (error) throw new ValidationError(null, error);

    const { accessToken, refreshToken, user } = await UserService.verifyNewUser(
      value,
      req.headers['user-agent'],
      requestIp.getClientIp(req),
    );

    // ! Create secure cookie with refresh token.
    res.cookie('jwt', refreshToken.token, {
      httpOnly: true,
      sameSite: 'none',
      secure: constants.secure_cookie,
      maxAge: constants.jwt.exp_time.refresh * 1000,
    });

    const response = this.apiResponse('User verified', { user, accessToken });

    res.status(HttpCode.OK).json(response);
  };

  static getUsers = async (req, res) => {
    const { count, users } = await UserService.getUsers(
      req.currentUser.tenantId,
    );

    const message = this.getMsgFromCount(count);
    const response = this.apiResponse(message, users);

    res.status(HttpCode.OK).json(response);
  };

  static getUser = async (req, res) => {
    const user = await UserService.getUserById(req.params.userId);
    const response = this.apiResponse('Fetched user', user);

    res.status(HttpCode.OK).json(response);
  };

  static getCurrentUser = async (req, res) => {
    const user = await UserService.getCurrentUser(req.currentUser._id);
    const response = this.apiResponse('Fetched current user', user);

    res.status(HttpCode.OK).json(response);
  };

  static updateUser = async (req, res) => {
    const { value, error } = userValidator.validateUpdate(req.body);
    if (error) throw new ValidationError(null, error);

    const user = await UserService.updateUser(req.params.userId, value);
    const response = this.apiResponse('User account update', user);

    res.status(HttpCode.OK).json(response);
  };

  static deleteUser = async (req, res) => {
    await UserService.deleteUser(req.params.userId);
    const response = this.apiResponse('User account deleted');

    res.status(HttpCode.OK).json(response);
  };

  static changePassword = async (req, res) => {
    const { value, error } = userValidator.validateUpdatePassword(req.body);
    if (error) throw new ValidationError(null, error);

    await UserService.changePassword(req.params.userId, value);
    const response = this.apiResponse('Password updated');

    res.status(HttpCode.OK).json(response);
  };

  // todo Discuss with Vic your ideas on forgot password flow.
  static forgotPassword = async (req, res) => {
    const { value, error } = await userValidator.validateForgotPassword(
      req.body,
    );
    if (error) throw new ValidationError(null, error);

    await UserService.forgotPassword(value);
    const response = this.apiResponse('User password has been reset.');

    res.status(HttpCode.OK).json(response);
  };

  static resetPassword = async (req, res) => {
    await UserService.resetPassword(req.params.userId);
    const response = this.apiResponse('User password has been reset.');

    res.status(HttpCode.OK).json(response);
  };

  static deactivateUser = async (req, res) => {
    const { value, error } = userValidator.validateDeactivation(req.body);
    if (error) throw new ValidationError(null, error);

    await UserService.deactivateUser(req.params.userId, value);
    const response = this.apiResponse('User deactivated');

    res.status(HttpCode.OK).json(response);
  };

  static reactivateUser = async (req, res) => {
    await UserService.reactivateUser(req.params.userId);
    const response = this.apiResponse('User has been reactivated');

    res.status(HttpCode.OK).json(response);
  };

  static uploadFiles = async (req, res) => {
    const user = await UserService.uploadImage(req.params, req.file);
    const response = this.apiResponse('File uploaded', user);

    res.status(HttpCode.OK).json(response);
  };
}

export default UserController;

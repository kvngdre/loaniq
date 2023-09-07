import requestIp from "request-ip";
import { constants } from "../../config/index.js";
import { AuthService } from "../../services/index.js";
import ErrorResponse from "../../utils/ErrorResponse.js";
import { HttpCode } from "../../utils/common.js";
import { ValidationError } from "../../utils/errors/index.js";
import authValidator from "../../validators/auth.validator.js";
import { tenantValidator } from "../../validators/tenant.validator.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";
import BaseController from "./base.controller.js";

export class AuthController extends BaseController {
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static register = async (req, res) => {
    const { value, error } = tenantValidator.validateSignUp(req.body);
    if (error) throw new ValidationError(null, error);

    const result = await AuthService.register(value);
    const response = BaseHttpResponse.success(result.message, result.data);

    res.status(HttpCode.CREATED).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static login = async (req, res) => {
    const token = req.cookies?.jwt;
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: constants.secure_cookie,
    });

    const { value, error } = authValidator.validateLogin(req.body);
    if (error) throw new ValidationError(null, error);

    const [data, refreshToken] = await AuthService.login(
      value,
      token,
      req.headers["user-agent"],
      requestIp.getClientIp(req),
    );
    const response = this.apiResponse("Login successful", data);

    //  ! Create secure cookie with refresh token.
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: constants.secure_cookie,
      maxAge: constants.jwt.exp_time.refresh * 1000,
    });

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static getNewTokens = async (req, res) => {
    const token = req.cookies?.jwt;
    if (!token) {
      return res.status(HttpCode.BAD_REQUEST).json(
        new ErrorResponse({
          name: "Validation Error",
          message: "No token provided",
        }),
      );
    }

    // Clear jwt cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: constants.secure_cookie,
    });

    const [accessToken, refreshToken] = await AuthService.getNewTokens(token);

    //! Create secure cookie with refresh token.
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: constants.secure_cookie,
      maxAge: constants.jwt.exp_time.refresh * 1000,
    });

    const response = this.apiResponse("Success", { accessToken });
    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static sendOTP = async (req, res) => {
    const { value, error } = authValidator.validateSendOTP(req.query);
    if (error) throw new ValidationError(null, error);

    await AuthService.sendOTP(value);
    const response = this.apiResponse("OTP sent to email.");

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static logout = async (req, res) => {
    await AuthService.logout(req.cookies?.jwt);

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: constants.secure_cookie,
    });

    const response = this.apiResponse("Logged out");
    res.status(HttpCode.NO_CONTENT).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static signOutAllSessions = async (req, res) => {
    await AuthService.signOutAllSessions(req.currentUser._id, req.cookies?.jwt);
    const response = this.apiResponse("Signed out of all devices.");

    res.status(HttpCode.OK).json(response);
  };

  static callback = (req, res) => {
    res.status(200).json(req.body);
  };
}

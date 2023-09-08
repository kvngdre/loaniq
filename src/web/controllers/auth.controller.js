import { config } from "../../config/index.js";
import { AuthService } from "../../logic/services/index.js";
import ErrorResponse from "../../utils/ErrorResponse.js";
import { HttpCode } from "../../utils/common.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";
import BaseController from "./base.controller.js";

export class AuthController extends BaseController {
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static register = async (req, res) => {
    const result = await AuthService.register(req.body);
    const response = BaseHttpResponse.success(result.message, result.data);

    res.status(HttpCode.CREATED).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static verify = async (req, res) => {
    const result = await AuthService.verify(
      req.query.email,
      req.body.otp,
      // req.headers["user-agent"],
      // req.clientIp,
    );

    // res.cookie("jwt", refreshToken.token, {
    //   httpOnly: true,
    //   sameSite: "none",
    //   secure: config.secure_cookie,
    //   maxAge: config.jwt.exp_time.refresh * 1000,
    // });

    const response = BaseHttpResponse.success(result.message);

    res.json(response);
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
      secure: config.secure_cookie,
    });

    // const { value, error } = authValidator.validateLogin(req.body);
    // if (error) throw new ValidationError(null, error);

    const { message, data, refreshToken } = await AuthService.login(
      req.body,
      token,
      req.headers["user-agent"],
      req.clientIp,
    );
    const response = BaseHttpResponse.success(message, data);

    //  ! Create secure cookie with refresh token.
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: config.secure_cookie,
      maxAge: config.jwt.ttl.refresh * 1000,
    });

    res.json(response);
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
      secure: config.secure_cookie,
    });

    const [accessToken, refreshToken] = await AuthService.getNewTokens(token);

    //! Create secure cookie with refresh token.
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: config.secure_cookie,
      maxAge: config.jwt.exp_time.refresh * 1000,
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
    // const { value, error } = authValidator.validateSendOTP(req.query);
    // if (error) throw new ValidationError(null, error);

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
      secure: config.secure_cookie,
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

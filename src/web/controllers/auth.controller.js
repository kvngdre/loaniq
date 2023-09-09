import { config } from "../../config/index.js";
import { AuthService } from "../../logic/services/index.js";
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
    const result = await AuthService.verify(req.query.email, req.body.otp);
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

    // ! Create secure cookie with refresh token.
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
  static logout = async (req, res) => {
    const result = await AuthService.logout(req.cookies?.jwt);
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: config.secure_cookie,
    });

    const response = BaseHttpResponse.success(result.message, result.data);

    res.json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static logOutAllSessions = async (req, res) => {
    const result = await AuthService.logOutAllSessions(req.cookies?.jwt);
    const response = BaseHttpResponse.success(result.message);

    res.json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static genTokens = async (req, res) => {
    const { message, data } = await AuthService.genTokenSet(
      req.cookies?.jwt,
      req.headers["user-agent"],
      req.clientIp,
    );

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: config.secure_cookie,
    });

    res.cookie("jwt", data.refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: config.secure_cookie,
      maxAge: config.jwt.ttl.refresh * 1_000,
    });

    const response = BaseHttpResponse.success(message, {
      accessToken: data.accessToken,
    });

    res.json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static requestOTP = async (req, res) => {
    const result = await AuthService.requestToken(req.body);
    const response = BaseHttpResponse.success(result.message, result.data);

    res.json(response);
  };

  static callback = (req, res) => {
    res.status(200).json(req.body);
  };
}

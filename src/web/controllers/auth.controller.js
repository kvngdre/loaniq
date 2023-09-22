import { config } from "../../config/index.js";
import { AuthService } from "../../logic/services/index.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";

export class AuthController {
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static register = async (req, res) => {
    const { message, data } = await AuthService.register(req.body);
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static verifyRegistration = async (req, res) => {
    const { message, data } = await AuthService.verifyRegistration(req.body);
    const response = BaseHttpResponse.success(message, data);

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
      // TODO: set this permanently to TRUE
      secure: config.secure_cookie,
    });

    const { message, data } = await AuthService.login(
      req.user,
      req.body.password,
      token,
      req.headers["user-agent"],
      req.clientIp,
    );
    const response = BaseHttpResponse.success(message, data);

    // ! Create secure cookie with refresh token.
    res.cookie("jwt", data.refreshToken, {
      httpOnly: true,
      sameSite: "none",
      // TODO: set this permanently to TRUE
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
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      // TODO: set this permanently to TRUE
      secure: config.secure_cookie,
    });

    const { message, data } = await AuthService.logout(req.cookies?.jwt);

    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static logOutAllSessions = async (req, res) => {
    const { message, data } = await AuthService.logOutAllSessions(
      req.cookies?.jwt,
    );
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static refreshTokenSet = async (req, res) => {
    const { message, data } =
      await AuthService.refreshAccessTokenAndGenerateNewRefreshToken(
        req.cookies?.jwt,
        req.headers["user-agent"],
        req.clientIp,
      );

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      // TODO: set this permanently to TRUE
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
    const { message, data } = await AuthService.requestToken(req.body);
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static forgotPassword = async (req, res) => {
    const { message, data } = await AuthService.initiatePasswordReset(
      req.body.email,
    );
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static resetPasswordWithVerification = async (req, res) => {
    const { message, data } =
      await AuthService.resetUserPasswordWithVerification(req.body);
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static resetPasswordWithoutVerification = async (req, res) => {
    const { message, data } =
      await AuthService.resetUserPasswordWithoutVerification(req.body);
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };
}

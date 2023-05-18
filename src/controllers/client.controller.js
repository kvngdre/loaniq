import { httpCodes } from '../utils/common.js';
import BaseController from './base.controller.js';
import ClientService from '../services/client.service.js';
import clientValidator from '../validators/client.validator.js';
import ValidationError from '../errors/ValidationError.js';
import requestIp from 'request-ip';
import { constants } from '../config/index.js';

class OriginController extends BaseController {
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static createClient = async (req, res) => {
    const { value, error } = clientValidator.validateCreate(req.body);
    if (error) throw new ValidationError(null, error);

    const newClient = await ClientService.create(value);
    const response = this.apiResponse('Client created', newClient);

    res.status(httpCodes.CREATED).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static verifySignup = async (req, res) => {
    const { value, error } = clientValidator.validateVerifySignup(req.body);
    if (error) throw new ValidationError(null, error);

    const { accessToken, refreshToken, user } = await ClientService.verifyClient(value, req.headers['user-agent'], requestIp.getClientIp(req));

    // ! Create secure cookie with refresh token.
    res.cookie('jwt', refreshToken.token, {
      httpOnly: true,
      sameSite: 'none',
      secure: constants.secure_cookie,
      maxAge: constants.jwt.exp_time.refresh * 1000,
    });

    const response = this.apiResponse('Client verified', { user, accessToken });

    res.status(httpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static signup = async (req, res) => {
    const { value, error } = clientValidator.validateSignup(req.body);
    if (error) throw new ValidationError(null, error);

    const newClient = await ClientService.register(value);
    const response = this.apiResponse('Registration successful', newClient);

    res.status(httpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static getClients = async (req, res) => {
    const { value, error } = clientValidator.validateFilters(req.query);
    if (error) throw new ValidationError(null, error);

    const { count, foundClients } = await ClientService.getClients(value);
    const message = this.getMsgFromCount(count);
    const response = this.apiResponse(message, foundClients);

    res.status(httpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static getClient = async (req, res) => {
    const foundClient = await ClientService.getClientById(req.params.clientId);
    const response = this.apiResponse('Fetched client', foundClient);

    res.status(httpCodes.OK).json(response);
  };
}

export default OriginController;

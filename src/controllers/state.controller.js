import ValidationError from '../errors/validation.error.js';
import StateService from '../services/state.service.js';
import { HttpCodes } from '../utils/HttpCodes.js';
import stateValidator from '../validators/stateValidator.js';
import BaseController from './base.controller.js';

class StateController extends BaseController {
  static createState = async (req, res) => {
    const { value, error } = stateValidator.validateCreate(req.body);
    if (error) throw new ValidationError(null, error);

    const newState = await StateService.create(value);
    const response = this.apiResponse('State created.', newState);

    res.status(HttpCodes.CREATED).json(response);
  };

  static getStates = async (req, res) => {
    const [count, states] = await StateService.getStates();
    const message = this.getMsgFromCount(count);

    const response = this.apiResponse(message, states);
    res.status(HttpCodes.OK).json(response);
  };

  static getState = async (req, res) => {
    const state = await StateService.getState(req.params.stateId);
    const response = this.apiResponse('Fetched state.', state);

    res.status(HttpCodes.OK).json(response);
  };

  static updateState = async (req, res) => {
    const { value, error } = stateValidator.validateUpdate(req.body);
    if (error) throw new ValidationError(null, error);

    const state = await StateService.update(req.params.stateId, value);
    const response = this.apiResponse('State updated.', state);

    res.status(HttpCodes.OK).json(response);
  };

  static deleteState = async (req, res) => {
    await StateService.delete(req.params.stateId);
    const response = this.apiResponse('State deleted.');

    res.status(HttpCodes.OK).json(response);
  };
}

export default StateController;

import { httpCodes } from '../utils/common.js';
import BaseController from './base.controller.js';
import EmailService from '../services/email.service.js';
import emailTemplateValidator from '../validators/email-template.validator.js';
import ValidationError from '../errors/ValidationError.js';

class EmailTemplateController extends BaseController {
  /**
   * Creates a new email template
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  static createTemplate = async (req, res) => {
    const { value, error } = emailTemplateValidator.validateCreate(req.body);
    if (error) throw new ValidationError(null, error);

    const newTemplate = await EmailService.addTemplate(value);
    const response = this.apiResponse('Template created', newTemplate);

    res.status(httpCodes.CREATED).json(response);
  };

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  static getTemplates = async (req, res) => {
    const { count, foundTemplates } = await EmailService.getTemplates();
    const message = this.getMsgFromCount(count);
    const response = this.apiResponse(message, foundTemplates);

    res.status(httpCodes.OK).json(response);
  };

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  static getTemplate = async (req, res) => {
    const foundTemplate = await EmailService.getTemplate(req.params.templateId);
    const response = this.apiResponse('Fetched template', foundTemplate);

    res.status(httpCodes.OK).json(response);
  };

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  static updateTemplate = async (req, res) => {
    const { value, error } = emailTemplateValidator.validateUpdate(req.body);
    if (error) throw new ValidationError(null, error);

    const template = await EmailService.updateTemplate(req.params.templateId, value);
    const response = this.apiResponse('Template updated', template);

    res.status(httpCodes.OK).json(response);
  };

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  static deleteTemplate = async (req, res) => {
    await EmailService.deleteTemplate(req.params.templateId);
    const response = this.apiResponse('Template deleted');

    res.status(httpCodes.NO_CONTENT).json(response);
  };
}

export default EmailTemplateController;

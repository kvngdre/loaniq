import ValidationError from '../errors/validation.error.js';
import tenantConfigService from '../services/tenantConfig.service.js';
import { HttpCodes } from '../utils/HttpCodes.js';
import tenantConfigValidator from '../validators/tenantConfig.validator.js';
import BaseController from './base.controller.js';

class TenantConfigController extends BaseController {
  static createConfig = async (req, res) => {
    const { value, error } = tenantConfigValidator.validateCreate(req.body);
    if (error) throw new ValidationError(null, error);

    const newConfiguration = await tenantConfigService.createConfig(value);
    const response = this.apiResponse('Tenant configurations created.', newConfiguration);

    res.status(HttpCodes.CREATED).json(response);
  };

  static getConfigs = async (req, res) => {
    const [count, tenantConfigs] = await tenantConfigService.getConfigs();

    const message = this.getMsgFromCount(count);
    const response = this.apiResponse(message, tenantConfigs);

    res.status(HttpCodes.OK).json(response);
  };

  static getConfig = async (req, res) => {
    const tenantConfig = await tenantConfigService.getConfig({ tenantId: req.params.tenantId });
    const response = this.apiResponse('Fetched tenant configurations.', tenantConfig);

    res.status(HttpCodes.OK).json(response);
  };

  static updateConfig = async (req, res) => {
    const { value, error } = tenantConfigValidator.validateUpdate(req.body);
    if (error) throw new ValidationError(null, error);

    const tenantConfig = await tenantConfigService.updateConfig(req.params.tenantId, value);
    const response = this.apiResponse('Tenant configurations updated.', tenantConfig);

    res.status(HttpCodes.OK).json(response);
  };

  static deleteConfig = async (req, res) => {
    await tenantConfigService.deleteConfig(req.params.tenantId);
    const response = this.apiResponse('Tenant configurations deleted.');

    res.status(HttpCodes.OK).json(response);
  };
}

export default TenantConfigController;

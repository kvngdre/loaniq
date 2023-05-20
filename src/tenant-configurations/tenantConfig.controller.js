import BaseController from '../controllers/base.controller.js';
import ValidationError from '../errors/validation.error.js';
import { HttpCode } from '../utils/HttpCode.js';
import tenantConfigValidator from '../validators/tenantConfig.validator.js';
import tenantConfigService from './tenantConfig.service.js';

class TenantConfigController extends BaseController {
  static createConfig = async (req, res) => {
    const { value, error } = tenantConfigValidator.validateCreate(req.body);
    if (error) throw new ValidationError(null, error);

    const newConfiguration = await tenantConfigService.createConfig(value);
    const response = this.apiResponse(
      'Tenant configurations created.',
      newConfiguration,
    );

    res.status(HttpCode.CREATED).json(response);
  };

  static getConfigs = async (req, res) => {
    const [count, tenantConfigs] = await tenantConfigService.getConfigs();

    const message = this.getMsgFromCount(count);
    const response = this.apiResponse(message, tenantConfigs);

    res.status(HttpCode.OK).json(response);
  };

  static getConfig = async (req, res) => {
    const tenantConfig = await tenantConfigService.getConfig({
      tenantId: req.params.tenantId,
    });
    const response = this.apiResponse(
      'Fetched tenant configurations.',
      tenantConfig,
    );

    res.status(HttpCode.OK).json(response);
  };

  static updateConfig = async (req, res) => {
    const { value, error } = tenantConfigValidator.validateUpdate(req.body);
    if (error) throw new ValidationError(null, error);

    const tenantConfig = await tenantConfigService.updateConfig(
      req.params.tenantId,
      value,
    );
    const response = this.apiResponse(
      'Tenant configurations updated.',
      tenantConfig,
    );

    res.status(HttpCode.OK).json(response);
  };

  static deleteConfig = async (req, res) => {
    await tenantConfigService.deleteConfig(req.params.tenantId);
    const response = this.apiResponse('Tenant configurations deleted.');

    res.status(HttpCode.OK).json(response);
  };
}

export default TenantConfigController;

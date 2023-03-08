import { httpCodes } from '../utils/constants'
import BaseController from './base.controller'
import tenantConfigService from '../services/tenantConfig.service'
import tenantConfigValidator from '../validators/tenantConfig.validator'
import ValidationError from '../errors/ValidationError'

class TenantConfigController extends BaseController {
  static createConfig = async (req, res) => {
    const { value, error } = tenantConfigValidator.validateCreate(
      req.body,
      req.currentUser.tenantId
    )
    if (error) throw new ValidationError(null, error)

    const newConfiguration = await tenantConfigService.createConfig(value)
    const response = this.apiResponse(
      'Tenant configuration created.',
      newConfiguration
    )

    res.status(httpCodes.CREATED).json(response)
  }

  static getConfigs = async (req, res) => {
    const [count, tenantConfigs] = await tenantConfigService.getConfigs()

    const message = this.getMsgFromCount(count)
    const response = this.apiResponse(message, tenantConfigs)

    res.status(httpCodes.OK).json(response)
  }

  static getConfig = async (req, res) => {
    const tenantConfig = await tenantConfigService.getConfig(req.params.tenantId)
    const response = this.apiResponse(
      'Fetched tenant configuration.',
      tenantConfig
    )

    res.status(httpCodes.OK).json(response)
  }

  static updateConfig = async (req, res) => {
    const { value, error } = tenantConfigValidator.validateUpdate(req.body)
    if (error) throw new ValidationError(null, error)

    const tenantConfig = await tenantConfigService.updateConfig(
      req.params.tenantId,
      value
    )
    const response = this.apiResponse(
      'Tenant configuration updated.',
      tenantConfig
    )

    res.status(httpCodes.OK).json(response)
  }

  static deleteConfig = async (req, res) => {
    await tenantConfigService.deleteConfig(req.params.tenantId)
    const response = this.apiResponse('Tenant configuration deleted.')

    res.status(httpCodes.OK).json(response)
  }
}

export default TenantConfigController

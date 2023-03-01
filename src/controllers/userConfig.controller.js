import { httpCodes } from '../utils/constants'
import BaseController from './base.controller'
import userConfigService from '../services/userConfig.service'
import userConfigValidator from '../validators/userConfig.validator'
import ValidationError from '../errors/ValidationError'

class UserConfigController extends BaseController {
  static createSettings = async (req, res) => {
    const { value, error } = userConfigValidator.validateCreate(req.body)
    if (error) throw new ValidationError(error.message, error.path)

    const newUserConfig = await userConfigService.createConfig(value)
    const response = this.apiResponse(
      'User configuration created.',
      newUserConfig
    )

    res.status(httpCodes.CREATED).json(response)
  }

  static getUserConfigs = async (req, res) => {
    const [count, userConfigs] = await userConfigService.getAllConfigs()

    const message = this.getMsgFromCount(count)
    const response = this.apiResponse(message, userConfigs)

    res.status(httpCodes.OK).json(response)
  }

  static getUserConfig = async (req, res) => {
    const userConfig = await userConfigService.getConfig(req.params)

    const response = this.apiResponse(
      'Fetched user configuration.',
      userConfig
    )

    res.status(httpCodes.OK).json(response)
  }

  static updateUserConfig = async (req, res) => {
    const { value, error } = userConfigValidator.validateCreate(req.body)
    if (error) throw new ValidationError(error.message, error.path)

    const userConfig = await userConfigService.updateConfig(req.params, value)
    const response = this.apiResponse(
      'Updated user configuration.',
      userConfig
    )

    res.status(httpCodes.OK).json(response)
  }

  static deleteUserConfig = async (req, res) => {
    await userConfigService.deleteConfig(req.params)

    const response = this.apiResponse(
      'Deleted user configuration.'
    )

    res.status(httpCodes.OK).json(response)
  }
}

export default UserConfigController

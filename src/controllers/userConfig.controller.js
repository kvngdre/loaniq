import { httpCodes } from '../utils/common'
import BaseController from './base.controller'
import userConfigService from '../services/userConfig.service'
import userConfigValidator from '../validators/userConfig.validator'
import ValidationError from '../errors/ValidationError'

class UserConfigController extends BaseController {
  static createConfig = async (req, res) => {
    const { value, error } = userConfigValidator.validateCreate(req.body)
    if (error) throw new ValidationError(null, error)

    const newUserConfig = await userConfigService.createConfig(value)
    const response = this.apiResponse(
      'User configurations created.',
      newUserConfig
    )

    res.status(httpCodes.CREATED).json(response)
  }

  static getUserConfigs = async (req, res) => {
    const [count, userConfigs] = await userConfigService.getConfigs()
    const message = this.getMsgFromCount(count)
    const response = this.apiResponse(message, userConfigs)

    res.status(httpCodes.OK).json(response)
  }

  static getUserConfig = async (req, res) => {
    const userConfig = await userConfigService.getConfig(req.params.userId)
    const response = this.apiResponse(
      'Fetched user configurations.',
      userConfig
    )

    res.status(httpCodes.OK).json(response)
  }

  static updateUserConfig = async (req, res) => {
    const { value, error } = userConfigValidator.validateCreate(req.body)
    if (error) throw new ValidationError(null, error)

    const userConfig = await userConfigService.updateConfig(
      req.params.userId,
      value
    )
    const response = this.apiResponse(
      'Updated user configurations.',
      userConfig
    )

    res.status(httpCodes.OK).json(response)
  }

  static deleteUserConfig = async (req, res) => {
    await userConfigService.deleteConfig(req.params.userId)
    const response = this.apiResponse('Deleted user configurations.')

    res.status(httpCodes.OK).json(response)
  }
}

export default UserConfigController

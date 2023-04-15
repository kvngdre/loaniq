import { httpCodes } from '../utils/common.js'
import BaseController from './base.controller.js'
import UserConfigService from '../services/userConfig.service.js'
import userConfigValidator from '../validators/userConfig.validator.js'
import ValidationError from '../errors/ValidationError.js'

class UserConfigController extends BaseController {
  /**
   * Creates a new user configuration
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  static createConfig = async (req, res) => {
    const { value, error } = userConfigValidator.validateCreate(req.body)
    if (error) throw new ValidationError(null, error)

    const newUserConfig = await UserConfigService.createConfig(value)
    const response = this.apiResponse(
      'User configurations created.',
      newUserConfig
    )

    res.status(httpCodes.CREATED).json(response)
  }

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  static getUserConfigs = async (req, res) => {
    const { count, foundConfigs } = await UserConfigService.getConfigs()
    const message = this.getMsgFromCount(count)
    const response = this.apiResponse(message, foundConfigs)

    res.status(httpCodes.OK).json(response)
  }

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  static getUserConfig = async (req, res) => {
    const userConfig = await UserConfigService.getConfig(req.params.userId)
    const response = this.apiResponse(
      'Fetched user configurations.',
      userConfig
    )

    res.status(httpCodes.OK).json(response)
  }

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  static updateUserConfig = async (req, res) => {
    const { value, error } = userConfigValidator.validateCreate(req.body)
    if (error) throw new ValidationError(null, error)

    const userConfig = await UserConfigService.updateConfig(
      req.params.userId,
      value
    )
    const response = this.apiResponse(
      'Updated user configurations.',
      userConfig
    )

    res.status(httpCodes.OK).json(response)
  }

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  static deleteUserConfig = async (req, res) => {
    await UserConfigService.deleteConfig(req.params.userId)
    const response = this.apiResponse('Deleted user configurations.')

    res.status(httpCodes.OK).json(response)
  }
}

export default UserConfigController

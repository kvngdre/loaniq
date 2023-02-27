import { httpCodes } from '../utils/constants'
import BaseController from './base.controller'
import SegConfigService from '../services/segConfig.service'
import segConfigValidator from '../validators/segConfig.validator'
import ValidationError from '../errors/ValidationError'

class SegConfigController extends BaseController {
  static createSegConfig = async (req, res) => {
    const { value, error } = segConfigValidator.validateCreate(req.currentUser.tenantId, req.body)
    if (error) throw new ValidationError(error.message, error.path)

    const newSegConfig = await SegConfigService.createSegConfig(value)
    const response = this.apiResponse(
      'Segment configurations created.',
      newSegConfig
    )

    res.status(httpCodes.CREATED).json(response)
  }

  static getSegConfigs = async (req, res) => {
    const { count, segConfigs } = await SegConfigService.getSegConfigs()
    const message = this.getMsgFromCount(count)

    const response = this.apiResponse(message, segConfigs)

    res.status(httpCodes.OK).json(response)
  }

  static getSegConfig = async (req, res) => {
    const segConfig = await SegConfigService.getSegConfig(
      req.params.segConfigId
    )
    const response = this.apiResponse(
      'Fetched segment configuration.',
      segConfig
    )

    res.status(httpCodes.OK).json(response)
  }

  static updateConfig = async (req, res) => {
    const { value, error } = segConfigValidator.validateUpdate(req.body)
    if (error) throw new ValidationError(error.message, error.path)

    const segConfig = await SegConfigService.updateSegConfig(
      req.params.segConfigId,
      value
    )
    const response = this.apiResponse(
      'Segment configurations updated.',
      segConfig
    )

    res.status(httpCodes.OK).json(response)
  }

  static deleteSegConfig = async (req, res) => {
    await SegConfigService.deleteSegConfig(req.params.segConfigId)
    const response = this.apiResponse('Segment configurations deleted.')

    res.status(httpCodes.OK).json(response)
  }
}

export default SegConfigController

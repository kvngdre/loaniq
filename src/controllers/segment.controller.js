import { httpCodes } from '../utils/constants'
import BaseController from './base.controller'
import SegmentService from '../services/segment.service'
import segmentValidator from '../validators/segment.validator'
import ValidationError from '../errors/ValidationError'

class SegmentController extends BaseController {
  static createSegment = async (req, res) => {
    const { value, error } = segmentValidator.validateCreate(req.body)
    if (error) throw new ValidationError(error.message, error.path)

    const newSegment = await SegmentService.createSegment(value)
    const response = this.apiResponse('Segment created.', newSegment)

    res.status(httpCodes.CREATED).json(response)
  }

  static getSegments = async (req, res) => {
    const { count, segments } = await SegmentService.getSegments()

    const message = this.getMsgFromCount(count)
    const response = this.apiResponse(message, segments)

    res.status(httpCodes.OK).json(response)
  }

  static getSegment = async (req, res) => {
    const segment = await SegmentService.getSegment(req.params.segmentId)
    const response = this.apiResponse('Fetched segment.', segment)

    res.status(httpCodes.OK).json(response)
  }

  static updateSegment = async (req, res) => {
    const { value, error } = segmentValidator.validateUpdate(req.body)
    if (error) throw new ValidationError(error.message, error.path)

    const updatedSegment = await SegmentService.updateSegment(
      req.params.segmentId,
      value
    )
    const response = this.apiResponse('Segment updated.', updatedSegment)

    res.status(httpCodes.OK).json(response)
  }

  static deleteSegment = async (req, res) => {
    await SegmentService.deleteSegment(req.params.segmentId)
    const response = this.apiResponse('Segment deleted.')

    res.status(httpCodes.OK).json(response)
  }
}

export default SegmentController

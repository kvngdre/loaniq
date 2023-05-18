import ValidationError from '../errors/validation.error.js';
import SegmentService from '../services/segment.service.js';
import { HttpCodes } from '../utils/HttpCodes.js';
import segmentValidator from '../validators/segment.validator.js';
import BaseController from './base.controller.js';

class SegmentController extends BaseController {
  static createSegment = async (req, res) => {
    const { value, error } = segmentValidator.validateCreate(req.body);
    if (error) throw new ValidationError(null, error);

    const newSegment = await SegmentService.createSegment(value);
    const response = this.apiResponse('Segment created.', newSegment);

    res.status(HttpCodes.CREATED).json(response);
  };

  static getSegments = async (req, res) => {
    const { count, segments } = await SegmentService.getSegments();

    const message = this.getMsgFromCount(count);
    const response = this.apiResponse(message, segments);

    res.status(HttpCodes.OK).json(response);
  };

  static getSegment = async (req, res) => {
    const segment = await SegmentService.getSegment(req.params.segmentId);
    const response = this.apiResponse('Fetched segment.', segment);

    res.status(HttpCodes.OK).json(response);
  };

  static updateSegment = async (req, res) => {
    const { value, error } = segmentValidator.validateUpdate(req.body);
    if (error) throw new ValidationError(null, error);

    const updatedSegment = await SegmentService.updateSegment(req.params.segmentId, value);
    const response = this.apiResponse('Segment updated.', updatedSegment);

    res.status(HttpCodes.OK).json(response);
  };

  static deleteSegment = async (req, res) => {
    await SegmentService.deleteSegment(req.params.segmentId);
    const response = this.apiResponse('Segment deleted.');

    res.status(HttpCodes.OK).json(response);
  };
}

export default SegmentController;

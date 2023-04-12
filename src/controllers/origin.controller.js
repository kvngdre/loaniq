import BaseController from './base.controller.js'
import originService from '../services/origin.service.js'
import { httpCodes } from '../utils/common.js'

class OriginController extends BaseController {
  static getOne = async (req, res) => {
    const foundLoanee = await originService.getLoaneeById(req.params.loaneeId)
    const response = this.apiResponse('Fetched customer', foundLoanee)

    res.status(httpCodes.OK).json(response)
  }
}

export default OriginController

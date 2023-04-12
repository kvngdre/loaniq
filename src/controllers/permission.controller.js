import permissionService from '../services/permission.service.js'
import { httpCodes } from '../utils/common.js'
import BaseController from './base.controller.js'

class PermissionController extends BaseController {
  static create = async (req, res) => {
    const newPermission = await permissionService.create(req.body)
    const response = this.apiResponse('Permission created', newPermission)

    res.status(httpCodes.CREATED).json(response)
  }

  static getPermissions = async (req, res) => {
    const { count, foundPermissions } = await permissionService.getPermissions()
    const message = this.getMsgFromCount(count)
    const response = this.apiResponse(message, foundPermissions)

    res.status(httpCodes.OK).json(response)
  }
}

export default PermissionController

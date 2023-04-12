import { httpCodes } from '../utils/common.js'
import BaseController from './base.controller.js'
import roleService from '../services/role.service.js'

class RoleController extends BaseController {
  static create = async(req, res) => {
    console.log('Rollesssss')
    req.body.tenantId = req.currentUser.tenantId
    const newRole = await roleService.create(req.body)
    const response = this.apiResponse('Role created', newRole)

    res.status(httpCodes.CREATED).json(response)
  }

  static getRoles = async(req, res) => {
    console.log('===========Rollesssss')
    const { count, foundRoles } = await roleService.getRoles(req.currentUser.tenantId)
    const message = this.getMsgFromCount(count)
    const response = this.apiResponse(message, foundRoles)

    res.status(httpCodes.OK).json(response)
  }
}

export default RoleController

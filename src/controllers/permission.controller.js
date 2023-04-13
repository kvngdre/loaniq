import { httpCodes } from '../utils/common.js'
import BaseController from './base.controller.js'
import PermissionService from '../services/permission.service.js'

class PermissionController extends BaseController {
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async create(req, res) {
    const newPermission = await PermissionService.create(req.body)
    const response = this.apiResponse('Permission created', newPermission)

    res.status(httpCodes.CREATED).json(response)
  }

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async getPermissions(req, res) {
    const { count, foundPermissions } = await PermissionService.getPermissions()
    const message = this.getMsgFromCount(count)
    const response = this.apiResponse(message, foundPermissions)

    res.status(httpCodes.OK).json(response)
  }

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async getPermission(req, res) {
    const foundPermission = await PermissionService.getPermission(req.params.permissionId)
    const response = this.apiResponse('Fetched permission', foundPermission)

    res.status(httpCodes).json(response)
  }

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async updatePermission(req, res) {
    const permission = await PermissionService.updatePermission(req.params.permissionId)
    const response = this.apiResponse('Permission updated', permission)

    res.status(httpCodes.OK).json(response)
  }

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async deletePermission(req, res) {
    await PermissionService.deletePermission(req.params.permissionId)
    const response = this.apiResponse('Permission deleted')

    res.status(httpCodes.NO_CONTENT).json(response)
  }
}

export default PermissionController

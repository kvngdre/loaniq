import { httpCodes } from '../utils/common.js'
import BaseController from './base.controller.js'
import PermissionService from '../services/permission.service.js'
import permissionValidator from '../validators/permission.validator.js'
import ValidationError from '../errors/ValidationError.js'

class PermissionController extends BaseController {
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static create = async (req, res) => {
    const { value, error } = permissionValidator.validateCreate(req.body)
    if (error) throw new ValidationError(null, error)

    const newPermission = await PermissionService.create(value)
    const response = this.apiResponse('Permission created', newPermission)

    res.status(httpCodes.CREATED).json(response)
  }

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static getPermissions = async (req, res) => {
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
  static getPermission = async (req, res) => {
    const foundPermission = await PermissionService.getPermission(req.params.permissionId)
    const response = this.apiResponse('Fetched permission', foundPermission)

    res.status(httpCodes).json(response)
  }

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static updatePermission = async (req, res) => {
    const { value, error } = permissionValidator.validateUpdate(req.body)
    if (error) throw new ValidationError(null, error)

    const permission = await PermissionService.updatePermission(req.params.permissionId, value)
    const response = this.apiResponse('Permission updated', permission)

    res.status(httpCodes.OK).json(response)
  }

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static deletePermission = async (req, res) => {
    await PermissionService.deletePermission(req.params.permissionId)
    const response = this.apiResponse('Permission deleted')

    res.status(httpCodes.NO_CONTENT).json(response)
  }
}

export default PermissionController

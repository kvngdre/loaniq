import { httpCodes } from '../utils/common.js';
import BaseController from './base.controller.js';
import RoleService from '../services/role.service.js';

class RoleController extends BaseController {
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static create = async (req, res) => {
    req.body.tenantId = req.currentUser.tenantId;
    const newRole = await RoleService.createRole(req.body);
    const response = this.apiResponse('Role created', newRole);

    res.status(httpCodes.CREATED).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static getRoles = async (req, res) => {
    const { count, foundRoles } = await RoleService.getRoles(req.currentUser.tenantId);
    const message = this.getMsgFromCount(count);
    const response = this.apiResponse(message, foundRoles);

    res.status(httpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static getRole = async (req, res) => {
    const foundRole = await RoleService.getRole(req.params.roleId);
    const response = this.apiResponse('Fetched role', foundRole);

    res.status(httpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static updateRole = async (req, res) => {
    const role = await RoleService.updateRole(req.params.roleId);
    const response = this.apiResponse('Role updated', role);

    res.status(httpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static deleteRole = async (req, res) => {
    await RoleService.deleteRole(req.params.roleId);
    const response = this.apiResponse('Deleted role');

    res.status(httpCodes.OK).json(response);
  };
}

export default RoleController;

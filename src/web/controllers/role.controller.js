import { RoleService } from "../../logic/services/index.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";

export class RoleController {
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static index = async (req, res) => {
    const { message, data } = await RoleService.all();
    const response = BaseHttpResponse.success(message, data);

    res.json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static create = async (req, res) => {
    req.body.tenantId = req.currentUser.tenantId;
    const newRole = await RoleService.createRole(req.body);
    const response = this.apiResponse("Role created", newRole);

    res.status(201).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static show = async (req, res) => {
    const foundRole = await RoleService.getRole(req.params.id);
    const response = this.apiResponse("Fetched role", foundRole);

    res.json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static edit = async (req, res) => {
    const role = await RoleService.updateRole(req.params.id);
    const response = this.apiResponse("Role updated", role);

    res.json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static destroy = async (req, res) => {
    await RoleService.destroy(req.params.id);
    const response = this.apiResponse("Deleted role");

    res.json(response);
  };
}

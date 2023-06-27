import { ValidationException } from "../../errors/index.js";
import { tenantService } from "../../services/index.js";
import { HttpCode } from "../../utils/common.js";
import { tenantValidator } from "../../validators/tenant.validator.js";
import { BaseHttpResponse } from "../lib/base-http-response.js";

export class TenantController {
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async signUp(req, res) {
    const signUpResponse = await tenantService.createTenant(req.body);
    const response = BaseHttpResponse.success(signUpResponse, 200);

    res.status(response.statusCode).json(response);
  }

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static onBoardTenant = async (req, res) => {
    const { value, error } = tenantValidator.validateOnBoarding(req.body);
    if (error) throw new ValidationException(null, error);

    const tenant = await tenantService.onBoardTenant(value);
    const response = this.apiResponse("Tenant information updated.", tenant);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static getTenants = async (req, res) => {
    const [count, tenants] = await tenantService.getTenants();

    const message = this.getMsgFromCount(count);
    const response = this.apiResponse(message, tenants);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static getTenant = async (req, res) => {
    const tenant = await tenantService.getTenant(req.params.tenantId);
    const response = this.apiResponse("Fetched tenant.", tenant);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static getCurrentTenant = async (req, res) => {
    const tenant = await tenantService.getTenant(req.currentUser.tenantId);
    const response = this.apiResponse("Fetched tenant.", tenant);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static updateTenant = async (req, res) => {
    const { value, error } = tenantValidator.validateUpdate(req.body);
    if (error) throw new ValidationException(null, error);

    const tenant = await tenantService.updateTenant(req.params.tenantId, value);
    const response = this.apiResponse("Tenant updated.", tenant);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static deleteTenant = async (req, res) => {
    await tenantService.deleteTenant(req.params.tenantId);
    const response = this.apiResponse("Tenant deleted.");

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static requestTenantActivation = async (req, res) => {
    const { value, error } = tenantValidator.validateActivationRequest(
      req.body,
    );
    if (error) throw new ValidationException(null, error);

    const tenant = await tenantService.requestToActivateTenant(
      req.params.tenantId,
      value,
    );
    const response = this.apiResponse("Submitted and awaiting review.", tenant);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static activateTenant = async (req, res) => {
    const tenant = await tenantService.activateTenant();
    const response = this.apiResponse("Tenant deactivated", tenant);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static requestToDeactivateTenant = async (req, res) => {
    const { value, error } = tenantValidator.validateDeactivationRequest(
      req.body,
    );
    if (error) throw new ValidationException(null, error);

    await tenantService.requestToDeactivateTenant(req.currentUser, value);
    const response = this.apiResponse("Deactivation request sent");

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static reactivateTenant = async (req, res) => {
    const tenant = await tenantService.reactivateTenant(req.params.tenantId);
    const response = this.apiResponse("Tenant reactivated.", tenant);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static generatePublicUrl = async (req, res) => {
    const publicUrl = await tenantService.generateFormId(req.params.tenantId);
    const response = this.apiResponse("Link generated.", publicUrl);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static getPublicFormData = async (req, res) => {
    const formData = await tenantService.getFormData(req.params.formId);
    const response = this.apiResponse(
      "Fetched tenant public form data.",
      formData,
    );

    res.status(HttpCode.OK).json(response);
  };
}

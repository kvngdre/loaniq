import { ValidationError } from '../errors/index.js';
import { tenantService } from '../services/index.js';
import { HttpCode } from '../utils/common.js';
import tenantValidator from '../validators/tenant.validator.js';
import BaseController from './base.controller.js';

class TenantController {
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  signUp = async (req, res) => {
    const { value, error } = tenantValidator.validateSignUp(req.body);
    if (error) throw new ValidationError(null, error);

    const response = await tenantService.createTenant(value);

    res.status(HttpCode.CREATED).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  onBoardTenant = async (req, res) => {
    const { value, error } = tenantValidator.validateOnBoarding(req.body);
    if (error) throw new ValidationError(null, error);

    const tenant = await tenantService.onBoardTenant(value);
    const response = this.apiResponse('Tenant information updated.', tenant);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getTenants = async (req, res) => {
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
  getTenant = async (req, res) => {
    const tenant = await tenantService.getTenant(req.params.tenantId);
    const response = this.apiResponse('Fetched tenant.', tenant);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getCurrentTenant = async (req, res) => {
    const tenant = await tenantService.getTenant(req.currentUser.tenantId);
    const response = this.apiResponse('Fetched tenant.', tenant);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  updateTenant = async (req, res) => {
    const { value, error } = tenantValidator.validateUpdate(req.body);
    if (error) throw new ValidationError(null, error);

    const tenant = await tenantService.updateTenant(req.params.tenantId, value);
    const response = this.apiResponse('Tenant updated.', tenant);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  deleteTenant = async (req, res) => {
    await tenantService.deleteTenant(req.params.tenantId);
    const response = this.apiResponse('Tenant deleted.');

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  requestTenantActivavtion = async (req, res) => {
    const { value, error } = tenantValidator.validateActivationRequest(
      req.body,
    );
    if (error) throw new ValidationError(null, error);

    const tenant = await tenantService.requestToActivateTenant(
      req.params.tenantId,
      value,
    );
    const response = this.apiResponse('Submitted and awaiting review.', tenant);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  activateTenant = async (req, res) => {
    const tenant = await tenantService.activateTenant();
    const response = this.apiResponse('Tenant deactivated', tenant);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  requestToDeactivateTenant = async (req, res) => {
    const { value, error } = tenantValidator.validateDeactivationRequest(
      req.body,
    );
    if (error) throw new ValidationError(null, error);

    await tenantService.requestToDeactivateTenant(req.currentUser, value);
    const response = this.apiResponse('Deactivation request sent');

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  reactivateTenant = async (req, res) => {
    const tenant = await tenantService.reactivateTenant(req.params.tenantId);
    const response = this.apiResponse('Tenant reactivated.', tenant);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  generatePublicUrl = async (req, res) => {
    const publicUrl = await tenantService.generateFormId(req.params.tenantId);
    const response = this.apiResponse('Link generated.', publicUrl);

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getPublicFormData = async (req, res) => {
    const formData = await tenantService.getFormData(req.params.formId);
    const response = this.apiResponse(
      'Fetched tenant public form data.',
      formData,
    );

    res.status(HttpCode.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  uploadFiles = async (req, res) => {
    const tenant = await tenantService.uploadDocs(
      req.currentUser.tenantId,
      req.files,
    );
    const response = this.apiResponse('Files uploaded.', tenant);

    res.status(HttpCode.OK).json(response);
  };
}

export const tenantController = new TenantController();

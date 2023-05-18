import BaseController from '../controllers/base.controller.js';
import ValidationError from '../errors/validation.error.js';
import { HttpCodes } from '../utils/HttpCodes.js';
import tenantValidator from '../validators/tenant.validator.js';
import TenantService from './tenant.service.js';

class TenantController extends BaseController {
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static signUp = async (req, res) => {
    const { value, error } = tenantValidator.validateSignUp(req.body);
    if (error) throw new ValidationError(null, error);

    const result = await TenantService.createTenant(value);
    const response = this.apiResponse(
      'Tenant created. Check your email for OTP',
      result,
    );

    res.status(HttpCodes.CREATED).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static onBoardTenant = async (req, res) => {
    const { value, error } = tenantValidator.validateOnBoarding(req.body);
    if (error) throw new ValidationError(null, error);

    const tenant = await TenantService.onBoardTenant(value);
    const response = this.apiResponse('Tenant information updated.', tenant);

    res.status(HttpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static getTenants = async (req, res) => {
    const [count, tenants] = await TenantService.getTenants();

    const message = this.getMsgFromCount(count);
    const response = this.apiResponse(message, tenants);

    res.status(HttpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static getTenant = async (req, res) => {
    const tenant = await TenantService.getTenant(req.params.tenantId);
    const response = this.apiResponse('Fetched tenant.', tenant);

    res.status(HttpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static getCurrentTenant = async (req, res) => {
    const tenant = await TenantService.getTenant(req.currentUser.tenantId);
    const response = this.apiResponse('Fetched tenant.', tenant);

    res.status(HttpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static updateTenant = async (req, res) => {
    const { value, error } = tenantValidator.validateUpdate(req.body);
    if (error) throw new ValidationError(null, error);

    const tenant = await TenantService.updateTenant(req.params.tenantId, value);
    const response = this.apiResponse('Tenant updated.', tenant);

    res.status(HttpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static deleteTenant = async (req, res) => {
    await TenantService.deleteTenant(req.params.tenantId);
    const response = this.apiResponse('Tenant deleted.');

    res.status(HttpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static requestTenantActivavtion = async (req, res) => {
    const { value, error } = tenantValidator.validateActivationRequest(
      req.body,
    );
    if (error) throw new ValidationError(null, error);

    const tenant = await TenantService.requestToActivateTenant(
      req.params.tenantId,
      value,
    );
    const response = this.apiResponse('Submitted and awaiting review.', tenant);

    res.status(HttpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static activateTenant = async (req, res) => {
    const tenant = await TenantService.activateTenant();
    const response = this.apiResponse('Tenant deactivated', tenant);

    res.status(HttpCodes.OK).json(response);
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
    if (error) throw new ValidationError(null, error);

    await TenantService.requestToDeactivateTenant(req.currentUser, value);
    const response = this.apiResponse('Deactivation request sent');

    res.status(HttpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static reactivateTenant = async (req, res) => {
    const tenant = await TenantService.reactivateTenant(req.params.tenantId);
    const response = this.apiResponse('Tenant reactivated.', tenant);

    res.status(HttpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static generatePublicUrl = async (req, res) => {
    const publicUrl = await TenantService.generateFormId(req.params.tenantId);
    const response = this.apiResponse('Link generated.', publicUrl);

    res.status(HttpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static getPublicFormData = async (req, res) => {
    const formData = await TenantService.getFormData(req.params.formId);
    const response = this.apiResponse(
      'Fetched tenant public form data.',
      formData,
    );

    res.status(HttpCodes.OK).json(response);
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static uploadFiles = async (req, res) => {
    const tenant = await TenantService.uploadDocs(
      req.currentUser.tenantId,
      req.files,
    );
    const response = this.apiResponse('Files uploaded.', tenant);

    res.status(HttpCodes.OK).json(response);
  };
}

export default TenantController;

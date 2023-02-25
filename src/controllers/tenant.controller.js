import { httpCodes } from '../utils/constants'
import BaseController from './base.controller'
import TenantService from '../services/tenant.service'
import tenantValidator from '../validators/tenant.validator'
import ValidationError from '../errors/ValidationError'

class TenantController extends BaseController {
  static signUp = async (req, res) => {
    const { value, error } = tenantValidator.validateSignUp(req.body)
    if (error) throw new ValidationError(error.details[0].message)

    const newTenant = await TenantService.createTenant(value)
    const response = this.apiResponse(
      'Tenant created. Check user email to complete registration.',
      newTenant
    )

    res.status(httpCodes.CREATED).json(response)
  }

  static getTenants = async (req, res) => {
    const { count, tenants } = await TenantService.getTenants()

    const message = this.getMsgFromCount(count)
    const response = this.apiResponse(message, tenants)

    res.status(httpCodes.OK).json(response)
  }

  static getTenant = async (req, res) => {
    const tenant = await TenantService.getTenant(req.params.tenantId)
    const response = this.apiResponse('Fetched tenant.', tenant)

    res.status(httpCodes.OK).json(response)
  }

  static getCurrentTenant = async (req, res) => {
    const tenant = await TenantService.getTenant(req.currentUser.tenantId)
    const response = this.apiResponse('Fetched tenant.', tenant)

    res.status(httpCodes.OK).json(response)
  }

  static updateTenant = async (req, res) => {
    const { value, error } = tenantValidator.validateUpdate(req.body)
    if (error) throw new ValidationError(error.details[0].message)

    const tenant = await TenantService.updateTenant(req.params.tenantId, value)
    const response = this.apiResponse('Tenant updated.', tenant)

    res.status(httpCodes.OK).json(response)
  }

  static deleteTenant = async (req, res) => {
    await TenantService.deleteTenant(req.params.tenantId)
    const response = this.apiResponse('Tenant deleted.')

    res.status(httpCodes.OK).json(response)
  }

  static activateTenant = async (req, res) => {
    const { value, error } = tenantValidator.validateActivate(req.body)
    if (error) throw new ValidationError(error.details[0].message)

    await TenantService.activateTenant(
      req.params.tenantId,
      value
    )
    const response = this.apiResponse('Tenant activated')

    res.status(httpCodes.OK).json(response)
  }

  static deactivateTenant = async (req, res) => {
    const { value, error } = tenantValidator.validateDeactivate(req.body)
    if (error) throw new ValidationError(error.details[0].message)

    await TenantService.activateTenant(
      req.params.tenantId,
      value
    )
    const response = this.apiResponse('Tenant activated')

    res.status(httpCodes.OK).json(response)
  }

  static reactivateTenant = async (req, res) => {
    const tenant = await TenantService.reactivateTenant(req.params.tenantId)
    const response = this.apiResponse('Tenant reactivated.', tenant)

    res.status(httpCodes.OK).json(response)
  }
}

export default TenantController

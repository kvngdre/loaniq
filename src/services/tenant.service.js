/* eslint-disable camelcase */
import { startSession } from 'mongoose'
import ConflictError from '../errors/ConflictError'
import events from '../pubsub/events'
import genFormId from '../utils/genFormId'
import mailer from '../utils/mailer'
import pubsub from '../pubsub/PubSub'
import TenantDAO from '../daos/tenant.dao'
import UnauthorizedError from '../errors/UnauthorizedError'
import UserService from './user.service'
import tenantConfigService from './tenantConfig.service'
import driverUploader from '../utils/driveUploader'
import path from 'path'
import logger from '../utils/logger'
import fs from 'fs'

class TenantService {
  static async createTenant (dto) {
    // * Initializing transaction session.
    const trx = await startSession()
    try {
      const { tenant, user } = dto

      // ! Starting transaction.
      trx.startTransaction()

      const newTenant = await TenantDAO.insert(tenant, trx)
      user.tenantId = newTenant._id
      const newUser = await UserService.createUser(user, trx)

      // * Emitting new tenant and user sign up event.
      pubsub.publish(
        events.tenant.signUp,
        { tenantId: newTenant._id, ...newTenant._doc },
        trx
      )

      // * Send welcome mail...
      mailer({
        to: newTenant.email,
        subject: 'Great to have you onboard',
        name: newTenant.company_name,
        template: 'new-tenant'
      })

      // * Email sent successfully, committing changes.
      await trx.commitTransaction()
      trx.endSession()

      return {
        tenant: newTenant,
        user: newUser
      }
    } catch (exception) {
      // ! Exception thrown, roll back changes.
      await trx.abortTransaction()
      trx.endSession()

      throw exception
    }
  }

  static async getTenants () {
    const foundTenants = await TenantDAO.findAll()
    const count = Intl.NumberFormat('en-US').format(foundTenants.length)

    return { count, tenants: foundTenants }
  }

  static async getTenant (tenantId) {
    const foundTenant = await TenantDAO.findById(tenantId)

    return foundTenant
  }

  static async updateTenant (tenantId, updateDto) {
    const updateTenant = await TenantDAO.update(tenantId, updateDto)

    return updateTenant
  }

  static async deleteTenant (tenantId) {
    const deletedTenant = await TenantDAO.remove(tenantId)

    return deletedTenant
  }

  static async activateTenant (tenantId, activateDto) {
    const { cac_number, support } = activateDto
    const foundTenant = await TenantDAO.findById(tenantId)

    if (foundTenant.activated) {
      throw new ConflictError('Tenant has already been activated.')
    }

    foundTenant.set({
      emailVerified: true,
      activated: true,
      cac_number,
      support
    })
    await foundTenant.save()

    return foundTenant
  }

  static async deactivateTenant ({ id, tenantId }, { otp }) {
    const foundTenant = await TenantDAO.findById(tenantId)
    const foundOwner = await UserService.getUserById(id, {})

    validateOTP(foundOwner, otp)
    function validateOTP (owner, otp) {
      if (otp !== owner.otp.pin) {
        throw new UnauthorizedError('Invalid OTP.')
      }

      if (Date.now() > owner.otp.expires) {
        throw new UnauthorizedError('OTP has expired.')
      }
    }

    await mailer({
      to: foundOwner.email,
      subject: 'Tenant Deactivated',
      template: 'deactivate-tenant',
      name: foundOwner.name.first
    })

    /**
     * ? send a deactivate email to Apex!
     */
    foundTenant.set({ active: false })
    UserService.updateUsers({ tenantId }, { active: false })
    await foundTenant.save()

    return foundTenant
  }

  static async reactivateTenant (tenantId) {
    const foundTenant = await TenantDAO.findById(tenantId)

    /**
     * todo should only the owner user be reactivated,
     * todo and they activate every other user?
     */
    foundTenant.set({ active: true })
    UserService.updateUsers({ tenantId }, { active: true })
    await foundTenant.save()

    return foundTenant
  }

  static async generateFormId (tenantId) {
    const baseurl = 'http://localhost:8480/api/v1/loans/form/'
    const formId = genFormId()
    try {
      const updatedTenantConfig = await tenantConfigService.updateConfig(
        tenantId,
        { formId }
      )

      updatedTenantConfig._doc.formId = baseurl + formId

      return updatedTenantConfig
    } catch (error) {
      await this.generateFormId(tenantId)
    }
  }

  static async getPublicFormData (formId) {
    const { _id, form_data, socials, support } =
      await tenantConfigService.getConfigByField({ formId })
    const { logo, company_name } = await TenantDAO.findById(_id)

    return { ...form_data, logo, company_name, socials, support }
  }

  static async uploadDocs (tenantId, uploadFiles) {
    const foundTenant = await TenantDAO.findById(tenantId)
    const folderName = `t-${tenantId.toString()}`

    const [foundFolder] = await driverUploader.findFolder(folderName)

    // Selecting folder
    const folderId = foundFolder?.id
      ? foundFolder.id
      : await driverUploader.createFolder(folderName)

    logger.debug(folderId)

    for (const key of Object.keys(uploadFiles)) {
      const file = uploadFiles[key][0]

      const name = file.originalname
      const filePath = path.resolve(__dirname, `../../${file.path}`)
      const mimeType = file.mimetype

      const response = await driverUploader.createFile(
        name,
        filePath,
        folderId,
        mimeType
      )
      logger.debug(response.data.id)

      if (key === 'logo') {
        foundTenant.set({
          logo: response.data.id
        })
      }

      // Delete uploaded file from file system
      fs.unlinkSync(filePath)
    }

    await foundTenant.save({})
    return foundTenant
  }
}

// async handleGuestLoan (payload) {
//   try {
//     const lender = await findOne({ id })

//     user = {
//       id: payload.customer.employer.ippis,
//       lender: lender._id.toString(),
//       role: 'guest',
//       email: payload.customer.contactInfo.email
//     }

//     const response = await createLoanReq(user, payload)

//     return {
//       message: 'Loan application submitted successfully.',
//       data: response.data
//     }
//   } catch (exception) {
//     logger.error({
//       method: 'handle_guest_loan',
//       message: exception.message,
//       meta: exception.stack
//     })
//     debug(exception)
//     return { errorCode: 500, message: 'Something went wrong.' }
//   }
// }

export default TenantService

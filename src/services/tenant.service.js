/* eslint-disable camelcase */
import { genRandomStr } from '../helpers'
import { startSession } from 'mongoose'
import ConflictError from '../errors/ConflictError'
import driverUploader from '../utils/driveUploader'
import fs from 'fs'
import logger from '../utils/logger'
import mailer from '../utils/mailer'
import path from 'path'
import TenantConfigDAO from '../daos/tenantConfig.dao'
import TenantDAO from '../daos/tenant.dao'
import UnauthorizedError from '../errors/UnauthorizedError'
import UserService from './user.service'

class TenantService {
  static async createTenant (dto) {
    // * Initializing transaction session.
    const trx = await startSession()
    try {
      const { tenant, user } = dto

      // ! Starting transaction.
      trx.startTransaction()

      const newTenant = await TenantDAO.insert(tenant, trx)
      await TenantConfigDAO.insert({ tenantId: newTenant._id })
      user.tenantId = newTenant._id
      const newUser = await UserService.createUser(user, trx)

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

  static async getTenants (filters) {
    const foundTenants = await TenantDAO.findAll(filters)
    const count = Intl.NumberFormat('en-US').format(foundTenants.length)

    return [count, foundTenants]
  }

  static async getTenant (tenantId) {
    const foundTenant = await TenantDAO.findById(tenantId)
    return foundTenant
  }

  static async updateTenant (tenantId, dto) {
    const updateTenant = await TenantDAO.update(tenantId, dto)
    return updateTenant
  }

  static async deleteTenant (tenantId) {
    const deletedTenant = await TenantDAO.remove(tenantId)
    return deletedTenant
  }

  static async activateTenant (tenantId, dto) {
    const foundTenant = await TenantDAO.findById(tenantId)
    if (foundTenant.activated) {
      throw new ConflictError('Tenant has already been activated.')
    }

    foundTenant.set({
      emailVerified: true,
      activated: true,
      cac_number: dto.cac_number,
      support: dto.support
    })
    await foundTenant.save()

    return foundTenant
  }

  static async deactivateTenant ({ _id, tenantId }, { otp }) {
    const foundTenant = await TenantDAO.findById(tenantId)
    const foundOwner = await UserService.getUserById(_id, {})

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
      name: foundOwner.first_name
    })

    // ? send a deactivate email to Apex!
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
    try {
      const formId = genRandomStr(5)
      const updatedConfig = await TenantConfigDAO.update(tenantId, { formId })

      return updatedConfig
    } catch (error) {
      await this.generateFormId(tenantId)
    }
  }

  static async getFormData (formId) {
    const { form_data, socials, support, tenantId } =
      await TenantConfigDAO.findOne({ formId }).populate('tenantId')

    return {
      logo: tenantId.logo,
      name: tenantId.company_name,
      socials,
      support,
      ...form_data
    }
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

      // ! Delete uploaded file from file system
      fs.unlinkSync(filePath)
    }

    await foundTenant.save()
    return foundTenant
  }

  static async createConfig (dto) {
    const newConfig = await TenantConfigDAO.insert(dto)
    return newConfig
  }

  static async getConfigs (filters, projection) {
    const foundConfigs = await TenantConfigDAO.findAll(filters, projection)
    const count = Intl.NumberFormat('en-US').format(foundConfigs.length)

    return [count, foundConfigs]
  }

  static async getConfig (filter, projection) {
    const foundConfig = await TenantConfigDAO.findOne(filter, projection)
    return foundConfig
  }

  static async updateConfig (filter, dto, projection) {
    const updateConfig = await TenantConfigDAO.update(filter, dto, projection)
    return updateConfig
  }

  static async deleteConfig (filter) {
    const deletedConfig = await TenantConfigDAO.remove(filter)
    return deletedConfig
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

/* eslint-disable camelcase */
import { events, pubsub } from '../pubsub'
import { genRandomStr, validateOTP } from '../helpers/universal.helpers'
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
import UserDAO from '../daos/user.dao'
import UserService from './user.service'

class TenantService {
  static async createTenant (dto) {
    // * Initializing transaction session.
    const trx = await startSession()
    try {
      const { tenant, user } = dto

      // ! Starting transaction.
      trx.startTransaction()

      const [newTenant, newUser] = await Promise.all([
        TenantDAO.insert(tenant, trx),
        UserService.createUser(user, trx)
      ])

      // * Emitting new tenant and user sign up event.
      pubsub.publish(
        events.tenant.signUp,
        null,
        { tenantId: newTenant._id, ...newTenant._doc },
        trx
      )

      // Send welcome mail...
      setTimeout(() => {
        mailer({
          to: newUser.email,
          subject: 'Welcome to Apex!',
          name: newUser.first_name,
          template: 'new-tenant'
        })
      }, 120_000)

      // Committing changes.
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
      isEmailVerified: true,
      activated: true,
      ...dto
    })
    await foundTenant.save()

    return foundTenant
  }

  static async deactivateTenant ({ _id, tenantId }, { otp }) {
    const [foundTenant, foundOwner] = await Promise.all([
      TenantDAO.findById(tenantId),
      UserDAO.findById(_id)
    ])

    const { isValid, message } = validateOTP(foundOwner, otp)
    if (!isValid) throw new UnauthorizedError(message)

    await mailer({
      to: foundOwner.email,
      subject: 'Tenant Deactivated',
      template: 'deactivate-tenant',
      name: foundOwner.first_name
    })

    // ? send a deactivate email to Apex!
    foundTenant.set({ active: false })
    await UserDAO.updateMany({ tenantId }, { active: false })
    await foundTenant.save()

    return foundTenant
  }

  static async reactivateTenant (tenantId) {
    const [foundTenant] = await Promise.all([
      TenantDAO.update(tenantId, { active: true }),
      UserDAO.updateMany({ tenantId }, { active: true })
    ])

    /**
     * todo should only the owner user be reactivated,
     * todo and they activate every other user?
     */

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
    const { form_theme, socials, tenantId } = await TenantConfigDAO.findOne({
      formId
    })

    return {
      logo: tenantId.logo,
      name: tenantId.company_name,
      support: tenantId.support,
      socials,
      theme: form_theme
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

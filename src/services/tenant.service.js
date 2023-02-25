/* eslint-disable camelcase */
import { startSession } from 'mongoose'
import events from '../pubsub/events'
import generateOTP from '../utils/generateOTP'
import mailer from '../utils/mailer'
import pubsub from '../pubsub/PubSub'
import TenantDAO from '../daos/tenant.dao'
import UnauthorizedError from '../errors/UnauthorizedError'
import UserDAO from '../daos/user.dao'
import ConflictError from '../errors/ConflictError'

class TenantService {
  static async createTenant (dto) {
    const trx = await startSession()
    try {
      const { tenant, user } = dto
      // Start transaction
      trx.startTransaction()

      const generatedOTP = generateOTP(10)
      user.otp = generatedOTP
      user.password = Math.random().toString(36).substring(2, 8)

      const newTenant = await TenantDAO.insert(tenant, trx)
      user.tenantId = newTenant._id
      const newUser = await UserDAO.insert(user, trx)

      // Emitting events
      await pubsub.publish(
        events.tenant.signUp,
        { tenantId: newTenant._id, ...newTenant._doc },
        trx
      )
      await pubsub.publish(
        events.user.new,
        { userId: newUser._id, ...newUser._doc },
        trx
      )

      // Sending OTP to user email.
      await mailer({
        to: user.email,
        subject: 'Almost there, just one more step',
        name: user.name.first,
        template: 'new-tenant',
        payload: { otp: generatedOTP.pin, password: user.password }
      })

      await trx.commitTransaction()
      trx.endSession()

      // Delete fields from the new user object
      delete newUser._doc.otp
      delete newUser._doc.password
      delete newUser._doc.queryName
      delete newUser._doc.refreshTokens

      return {
        tenant: newTenant,
        user: newUser
      }
    } catch (exception) {
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

    if (foundTenant.activated) throw new ConflictError('Tenant has already been activated.')

    foundTenant.set({
      emailVerified: true,
      activated: true,
      cac_number,
      support
    })
    await foundTenant.save()

    return foundTenant
  }

  static async deactivateTenant (currentUser, deactivateDto) {
    const foundTenant = await TenantDAO.findById(currentUser.tenantId)
    const foundOwner = await UserDAO.findById(currentUser.id)

    const isMatch = await foundOwner.comparePasswords(deactivateDto.password)
    if (!isMatch) throw new UnauthorizedError('Invalid password.')

    /**
     * todo send a deactivate email to Apex!
     */
    foundTenant.set({ active: false })
    await UserDAO.updateMany(
      { tenantId: currentUser.tenantId },
      { active: false }
    )
    await foundTenant.save()

    return foundTenant
  }

  static async reactivateTenant (tenantId) {
    const foundTenant = await TenantDAO.findById(tenantId)

    foundTenant.set({ active: true })
    await UserDAO.updateMany({ tenantId }, { active: true })
    await foundTenant.save()

    return foundTenant
  }

  static async getPublicFormData () {}

  static async generatePublicURL () {}

  static async handleGuestLoan () {}
}

// async getPublicFormData (
//   shortURL,
//   selectedFields = ['logo', 'companyName', 'website', 'support', 'social']
// ) {
//   try {
//     const foundTenant = await findOne({ public_url: shortURL })
//       .select(selectedFields)
//       .select('-_id -otp')
//     if (!foundTenant) { return new ServerResponse(404, 'Tenant not found.') }

//     const token = foundTenant.generateToken()

//     const payload = delete foundTenant._id
//     payload.token = token

//     return new ServerResponse(200, 'Success', payload)
//   } catch (exception) {
// logger.error({
//       method: 'get_public_form_data',
//       message: exception.message,
//       meta: exception.stack
//     })
//     debug(exception)
//     return new ServerResponse(500, 'Something went wrong')
//   }
// }

// async generatePublicURL (tenantId) {
//   try {
//     const foundLender = await _findById(tenantId)
//     if (!foundLender) { return new ServerResponse(404, 'Tenant not found.') }
//     if (!foundLender.active) {
//       return new ServerResponse(
//         403,
//         'Tenant is yet to be activated.'
//       )
//     }

//     const shortUrl = await generateShortUrl()
//     foundLender.set({
//       publicUrl: shortUrl
//     })
//     await foundLender.save()

//     return {
//       message: 'success',
//       data: `http://apexxia.co/f/${shortUrl}`
//     }
//   } catch (exception) {
//     logger.error({
//       method: 'gen_public_url',
//       message: exception.message,
//       meta: exception.stack
//     })
//     debug(exception)
//     return new ServerResponse(500, 'Something went wrong')
//   }
// }

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

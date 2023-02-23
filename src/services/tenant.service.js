import { startSession } from 'mongoose'
import { tenant as _tenant, user as _user } from '../pubsub/events'
import { publish } from '../pubsub/PubSub'
import { insert } from '../daos/tenant.dao'
import { insert as _insert } from '../daos/user.dao'

class TenantService {
  static async createTenant (dto) {
    const trx = await startSession()
    try {
      const { tenant, user } = dto
      // Start transaction
      trx.startTransaction()

      const newTenant = await insert(tenant, trx)
      const newUser = await _insert(user, trx)

      await publish(_tenant.signUp, newTenant, trx)
      await publish(_user.new, newUser, trx)

      await trx.commitTransaction()
      trx.endSession()

      // Delete fields from the new tenant object
      delete newTenant._doc.otp
      delete newTenant._doc.totalCost

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
}

export default TenantService

import Tenant from '../models/tenant.model'
import BaseDAO from './BaseDAO'
import ConflictError from '../errors/ConflictError'
import ValidationError from '../errors/ValidationError'

class TenantDAO extends BaseDAO {
  constructor () {
    super()
  }

  static async insert (newRecordDto, trx) {
    try {
      const newRecord = new Tenant(newRecordDto)
      await newRecord.save({ session: trx })

      return newRecord
    } catch (exception) {
      if (exception.code === this.DUPLICATE_ERROR_CODE) {
        const field = this.getDuplicateField(exception)
        throw new ConflictError(`${field} already in use.`)
      }

      if (exception.name === 'ValidationError') {
        const errMsg = this.getValidationErrorMsg(exception)
        throw new ValidationError(errMsg)
      }

      throw exception
    }
  }
}

export default TenantDAO

import BaseDAO from './base.dao'
import ConflictError from '../errors/ConflictError'
import Tenant from '../models/tenant.model'
import ValidationError from '../errors/ValidationError'

class TenantDAO extends BaseDAO {
  static async insert (newRecordDto, trx) {
    try {
      const newRecord = new Tenant(newRecordDto)
      await newRecord.save({ session: trx })

      return newRecord
    } catch (exception) {
      if (exception.code === this.DUPLICATE_ERROR_CODE) {
        const field = this.getDuplicateField(exception)
        throw new ConflictError(`${field} already in use.`, 'Duplicate Error')
      }

      if (exception.name === 'ValidationError') {
        const errMsg = this.getValidationErrorMsg(exception)
        throw new ValidationError(errMsg)
      }

      throw exception
    }
  }

  static async findById (id, projection = {}) {
    const foundRecord = await Tenant.findById(id, projection)

    return foundRecord
  }

  static async findAll (query = {}, projection = {}) {
    const foundRecords = await Tenant.find(query, projection)

    return foundRecords
  }

  static async update (id, updateDto, projection = {}) {
    try {
      const foundRecord = await Tenant.findById(id, projection)

      foundRecord.set(updateDto)
      await foundRecord.save()

      return foundRecord
    } catch (exception) {
      if (exception.code === this.DUPLICATE_ERROR_CODE) {
        const field = this.getDuplicateField(exception)
        throw new ConflictError(`${field} already in use.`, 'Duplicate Error')
      }

      if (exception.name === 'ValidationError') {
        const errMsg = this.getValidationErrorMsg(exception)
        throw new ValidationError(errMsg)
      }

      throw exception
    }
  }

  static async remove (id) {
    const foundRecord = await Tenant.findByIdAndDelete(id)

    return foundRecord
  }
}

export default TenantDAO

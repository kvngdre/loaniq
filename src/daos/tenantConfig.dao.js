import BaseDAO from './base.dao'
import ConflictError from '../errors/ConflictError'
import TenantConfig from '../models/tenantConfig.model'
import ValidationError from '../errors/ValidationError'

class TenantConfigDAO extends BaseDAO {
  static async insert (newRecordDto, trx) {
    try {
      const newRecord = new TenantConfig(newRecordDto)
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

  static async findAll (query = {}, projection = {}) {
    const foundRecords = await TenantConfig.find(query, projection)

    return foundRecords
  }

  static async findById (tenantId, projection) {
    const foundRecords = await TenantConfig.findOne({ tenantId }, projection)

    return foundRecords
  }

  static async update (tenantId, updateRecordDto, projection = {}) {
    try {
      const foundRecord = await TenantConfig.findOne({ tenantId }, projection)

      foundRecord.set(updateRecordDto)
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

  static async remove (tenantId) {
    const deletedRecord = await TenantConfig.findByIdAndDelete({ tenantId })

    return deletedRecord
  }
}

export default TenantConfigDAO

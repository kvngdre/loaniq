import BaseDAO from './base.dao'
import ConflictError from '../errors/ConflictError'
import TenantConfig from '../models/tenantConfig.model'
import ValidationError from '../errors/ValidationError'

class TenantConfigDAO extends BaseDAO {
  static async insert (dto) {
    try {
      const newRecord = new TenantConfig(dto)
      await newRecord.save()

      return newRecord
    } catch (exception) {
      if (exception.code === this.DUPLICATE_ERROR_CODE) {
        const field = this.getDuplicateField(exception)
        throw new ConflictError(`${field} in use.`)
      }

      if (exception.name === 'ValidationError') {
        const errMsg = this.getValidationErrorMsg(exception)
        throw new ValidationError(errMsg)
      }

      throw exception
    }
  }

  static async findAll (filter = {}, projection = {}) {
    const foundRecords = await TenantConfig.find(filter).select(projection)
    return foundRecords
  }

  static async findOne (filter, projection = {}) {
    const foundRecord = await TenantConfig.findOne(filter).select(projection).populate('tenantId')
    return foundRecord
  }

  static async update (filter, dto, projection = {}) {
    try {
      const foundRecord = await TenantConfig.findOneAndUpdate(
        filter,
        dto,
        { upsert: true, new: true }
      ).select(projection)

      return foundRecord
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

  static async remove (filter) {
    const deletedRecord = await TenantConfig.findOneAndDelete(filter)

    return deletedRecord
  }
}

export default TenantConfigDAO

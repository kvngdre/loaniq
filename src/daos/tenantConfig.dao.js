import { Error } from 'mongoose'
import BaseDAO from './base.dao.js'
import ConflictError from '../errors/ConflictError.js'
import TenantConfig from '../models/tenantConfig.model.js'
import ValidationError from '../errors/ValidationError.js'

class TenantConfigDAO extends BaseDAO {
  static async insert (newTenantConfigDTO, trx) {
    try {
      const newRecord = new TenantConfig(newTenantConfigDTO)
      await newRecord.save({ session: trx })

      return newRecord
    } catch (exception) {
      if (exception.code === this.DUPLICATE_ERROR_CODE) {
        const field = this.getDuplicateField(exception)
        throw new ConflictError(`${field} in use.`)
      }

      if (exception instanceof Error.ValidationError) {
        const errMsg = this.getValidationErrorMsg(exception)
        throw new ValidationError(errMsg)
      }

      throw exception
    }
  }

  static async find (filter = {}, projection = {}) {
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

      if (exception instanceof Error.ValidationError) {
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

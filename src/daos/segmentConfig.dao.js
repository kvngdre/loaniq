import { Types } from 'mongoose'
import BaseDAO from './base.dao'
import ConflictError from '../errors/ConflictError'
import SegmentConfig from '../models/segmentConfig.model'
import ValidationError from '../errors/ValidationError'

class SegmentConfigDAO extends BaseDAO {
  static async insert (newRecordDto, trx) {
    try {
      const newRecord = new SegmentConfig(newRecordDto)
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
    const foundRecord = await SegmentConfig.findById(id, projection)

    return foundRecord
  }

  static async findDocsByField (query = null, projection = {}, orderBy = {}) {
    if (!query) throw new Error('Query object is required')

    const foundRecord = await SegmentConfig.find(query, projection).sort(orderBy)

    return foundRecord
  }


  static async findAll (query = {}, projection = {}) {
    const foundRecords = await SegmentConfig.find(query, projection)

    return foundRecords
  }

  static async update (query, updateDto, projection = {}) {
    try {
      query = !Types.ObjectId.isValid(query) ? query : { _id: query }
      const foundRecord = await SegmentConfig.findOne(query, projection)

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

  static async remove (query) {
    query = !Types.ObjectId.isValid(query) ? query : { _id: query }
    const deletedRecord = await SegmentConfig.findOneAndDelete(query)

    return deletedRecord
  }
}

export default SegmentConfigDAO

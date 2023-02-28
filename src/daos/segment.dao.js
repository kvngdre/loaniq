import { Types } from 'mongoose'
import BaseDAO from './base.dao'
import ConflictError from '../errors/ConflictError'
import Segment from '../models/segment.model'
import ValidationError from '../errors/ValidationError'

class SegmentDAO extends BaseDAO {
  static async insert (newRecordDto, trx) {
    try {
      const newRecord = new Segment(newRecordDto)
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
    const foundRecord = await Segment.findById(id, projection)

    return foundRecord
  }

  static async findAll (filter = {}, projection = {}) {
    const foundRecords = await Segment.find(filter, projection)

    return foundRecords
  }

  static async update (filter, updateDto, projection = {}) {
    try {
      filter = !Types.ObjectId.isValid(filter) ? filter : { _id: filter }
      const foundRecord = await Segment.findOne(filter, projection)

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

  static async remove (filter) {
    filter = !Types.ObjectId.isValid(filter) ? filter : { _id: filter }
    const deletedRecord = await Segment.findOneAndDelete(filter)

    return deletedRecord
  }
}

export default SegmentDAO

import BaseDAO from './base.dao'
import ConflictError from '../errors/ConflictError'
import UserConfig from '../models/userConfig.model'
import ValidationError from '../errors/ValidationError'
import { Types } from 'mongoose'

class UserConfigDAO extends BaseDAO {
  static async insert (newRecordDto, trx) {
    try {
      const newRecord = new UserConfig(newRecordDto)
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
    const foundRecord = await UserConfig.findById(id, projection)

    return foundRecord
  }

  static async findByField (query, projection = {}) {
    const foundRecord = await UserConfig.findOne(query, projection)

    return foundRecord
  }

  static async findAll (query = {}, projection = {}) {
    const foundRecords = await UserConfig.find(query, projection)

    return foundRecords
  }

  static async update (query, updateDto, projection = {}) {
    try {
      query = !Types.ObjectId.isValid(query) ? query : { _id: query }
      const foundRecord = await UserConfig.findOne(query, projection)

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
    const deletedRecord = await UserConfig.findOneAndDelete(query)

    return deletedRecord
  }
}

export default UserConfigDAO

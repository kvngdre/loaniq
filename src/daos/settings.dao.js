import BaseDAO from './base.dao'
import ConflictError from '../errors/ConflictError'
import Setting from '../models/settings.model'
import ValidationError from '../errors/ValidationError'
import { Types } from 'mongoose'

class SettingsDAO extends BaseDAO {
  static async insert (newRecordDto, trx) {
    try {
      const newRecord = new Setting(newRecordDto)
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

  static async findById (id, projection = {}) {
    const foundRecord = await Setting.findById(id, projection)

    return foundRecord
  }

  static async findAll (query = {}, projection = {}) {
    const foundRecords = await Setting.find(query, projection)

    return foundRecords
  }

  static async update (query, updateDto, projection = {}) {
    query = !Types.ObjectId.isValid(query) ? query : { _id: query }
    const foundRecord = await Setting.findOne(query, projection)

    foundRecord.set(updateDto)
    await foundRecord.save()

    return foundRecord
  }

  static async remove (id) {
    const deletedRecord = await Setting.findByIdAndDelete(id)

    return deletedRecord
  }
}

export default SettingsDAO

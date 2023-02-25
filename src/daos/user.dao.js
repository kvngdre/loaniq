import BaseDAO from './base.dao'
import ConflictError from '../errors/ConflictError'
import User from '../models/user.model'
import ValidationError from '../errors/ValidationError'

class UserDAO extends BaseDAO {
  static async insert (newRecordDto, trx) {
    try {
      const newRecord = new User(newRecordDto)
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
    const foundRecord = await User.findById(id, projection)

    return foundRecord
  }

  static async findByField (query = null, projection = {}) {
    if (!query) throw new Error('Query object is required')

    const foundRecord = await User.findOne(query, projection)

    return foundRecord
  }

  static async findAll (query = {}, projection = {}) {
    const foundRecords = await User.find(query, projection)

    return foundRecords
  }

  static async update (id, updateDto, projection = {}) {
    try {
      const foundRecord = await User.findById(id, projection)

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

  static async updateMany (matchObj, updateDto) {
    const result = await User.updateMany(matchObj, updateDto)

    return result
  }

  static async remove (id) {
    const foundRecord = await User.findByIdAndDelete(id)

    return foundRecord
  }
}

export default UserDAO

import BaseDAO from './base.dao.js'
import ConflictError from '../errors/ConflictError.js'
import User from '../models/user.model.js'
import ValidationError from '../errors/ValidationError.js'

class UserDAO extends BaseDAO {
  static async insert(dto, trx) {
    try {
      const newRecord = new User(dto)
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

  static async findAll(filter = {}, projection = {}) {
    const foundRecords = await User.find(filter).select(projection)

    return foundRecords
  }

  static async findById(id, projection = {}) {
    const foundRecord = await User.findById(id)
      .select(projection)
      .populate({ path: 'role', select: '-tenantId' })

    return foundRecord
  }

  static async findOne(filter, projection = {}) {
    const foundRecord = await User.findOne(filter)
      .select(projection)
      .populate({ path: 'role', select: '-tenantId' })

    return foundRecord
  }

  static async update(id, dto, projection = {}) {
    try {
      const foundRecord = await User.findById(id).select(projection)

      foundRecord.set(dto)
      await foundRecord.save()

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

  static async updateMany(filter, dto) {
    const result = await User.updateMany(filter, dto)

    return result
  }

  static async remove(id) {
    const foundRecord = await User.findByIdAndDelete(id)

    return foundRecord
  }
}

export default UserDAO

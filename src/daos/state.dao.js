import BaseDAO from './base.dao.js'
import ConflictError from '../errors/ConflictError.js'
import State from '../models/stateModel.js'
import ValidationError from '../errors/ValidationError.js'

class StateDAO extends BaseDAO {
  static async insert(dto) {
    try {
      const newRecord = new State(dto)
      await newRecord.save()

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
    const foundRecords = await State.find(filter).select(projection)

    return foundRecords
  }

  static async findById(id, projection = {}) {
    const foundRecord = await State.findById(id).select(projection)

    return foundRecord
  }

  static async findOne(filter, projection = {}) {
    const foundRecord = await State.findOne(filter).select(projection)

    return foundRecord
  }

  static async update(id, dto, projection = {}) {
    try {
      const foundRecord = await State.findById(id).select(projection)

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

  static async remove(id) {
    const foundRecord = await State.findByIdAndDelete(id)

    return foundRecord
  }
}

export default StateDAO

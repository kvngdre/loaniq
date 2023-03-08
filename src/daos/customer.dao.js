import BaseDAO from './base.dao'
import ConflictError from '../errors/ConflictError'
import Customer from '../models/customer.model'
import ValidationError from '../errors/ValidationError'

class CustomerDAO extends BaseDAO {
  static async insert (dto) {
    try {
      const newBank = new Customer(dto)
      await newBank.save()

      return newBank
    } catch (exception) {
      if (exception.code === this.DUPLICATE_ERROR_CODE) {
        const field = this.getDuplicateField(exception)
        throw new ConflictError(`${field} already in use.`)
      }

      if (exception.name === 'Validation Error') {
        const errMsg = this.getValidationErrorMsg(exception)
        throw new ValidationError(errMsg)
      }

      throw exception
    }
  }

  static async findAll (filter = {}, projection = {}) {
    const foundRecords = await Customer.find(filter).select(projection)

    return foundRecords
  }

  static async findById (id, projection = {}) {
    const foundRecord = await Customer.findById(id).select(projection)

    return foundRecord
  }

  static async findOne (filter, projection = {}) {
    const foundRecord = await Customer.findOne(filter).select(projection)

    return foundRecord
  }

  static async update (id, dto, projection = {}) {
    try {
      const foundRecord = await Customer.findById(id).select(projection)

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

  static async remove (id) {
    const deletedRecord = await Customer.findByIdAndDelete(id)

    return deletedRecord
  }
}

export default CustomerDAO

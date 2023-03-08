import BaseDAO from './base.dao'
import ConflictError from '../errors/ConflictError'
import ValidationError from '../errors/ValidationError'
import Wallet from '../models/wallet.model'

class WalletDAO extends BaseDAO {
  static async insert (dto, trx) {
    try {
      const newRecord = new Wallet(dto)
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

  static async findAll (filter = {}) {
    const foundRecords = await Wallet.find(filter)

    return foundRecords
  }

  static async findById (id, projection = {}) {
    const foundRecord = await Wallet.findById(id).select(projection)

    return foundRecord
  }

  static async findOne (filter, projection = {}) {
    const foundRecord = await Wallet.findOne(filter).select(projection)

    return foundRecord
  }

  static async update (filter, dto, projection = {}) {
    try {
      const foundRecord = await Wallet.findOne(filter).select(projection)

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

  static async remove (filter) {
    const foundRecord = await Wallet.findOneAndDelete(filter)
    return foundRecord
  }
}

export default WalletDAO

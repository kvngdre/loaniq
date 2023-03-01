import BaseDAO from './base.dao'
import ConflictError from '../errors/ConflictError'
import ValidationError from '../errors/ValidationError'
import Wallet from '../models/wallet.model'

class WalletDAO extends BaseDAO {
  static async insert (newRecordDto, trx) {
    try {
      const newRecord = new Wallet(newRecordDto)
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

  static async findById (id) {
    const foundRecord = await Wallet.findById(id)

    return foundRecord
  }

  static async findByField (filter) {
    const foundRecord = await Wallet.findOne(filter)

    return foundRecord
  }

  static async findAll () {
    const foundRecords = await Wallet.find({})

    return foundRecords
  }

  static async update (query, updateDto) {
    try {
      const foundRecord = await Wallet.findOne(query)

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
    const foundRecord = await Wallet.findOneAndDelete(query)

    return foundRecord
  }
}

export default WalletDAO

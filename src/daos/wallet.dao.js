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
        throw new ConflictError(`${field} already in use.`)
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

  static async findAll () {
    const foundRecords = await Wallet.find({})

    return foundRecords
  }

  static async update (id, updateDto) {
    const foundRecord = await Wallet.findById(id)

    foundRecord.set(updateDto)
    await foundRecord.save()

    return foundRecord
  }

  static async remove (id) {
    const foundRecord = await Wallet.findByIdAndDelete(id)

    return foundRecord
  }
}

export default WalletDAO

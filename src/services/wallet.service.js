import { startSession } from 'mongoose'
import { TxnObj } from '../helpers'
import events from '../pubsub/events'
import InsufficientError from '../errors/InsufficientError'
import pubsub from '../pubsub'
import WalletDAO from '../daos/wallet.dao'

class WalletService {
  constructor () {
    pubsub.subscribe(events.tenant.signUp, this.createWallet)
    pubsub.subscribe(events.webhook.success, this.creditWallet)
  }

  async createWallet (dto, trx) {
    const newWallet = await WalletDAO.insert(dto, trx)
    return newWallet
  }

  async getWallets (filter) {
    const foundWallets = await WalletDAO.findAll(filter)
    const count = Intl.NumberFormat('en-US').format(foundWallets.length)

    return [count, foundWallets]
  }

  async getWallet (tenantId) {
    const foundWallet = await WalletDAO.findOne({ tenantId })
    return foundWallet
  }

  async updateWallet (tenantId, dto) {
    const updatedWallet = await WalletDAO.update({ tenantId }, dto)

    return updatedWallet
  }

  async deleteWallet (tenantId) {
    const deletedWallet = await WalletDAO.remove({ tenantId })
    return deletedWallet
  }

  async getWalletBalance (tenantId) {
    const { balance } = await WalletDAO.findOne({ tenantId })

    return { balance }
  }

  async creditWallet (dto) {
    const trx = await startSession()
    try {
      // ! Starting transaction.
      trx.startTransaction()

      const foundWallet = await WalletDAO.findOne({ tenantId: dto.tenantId })
      dto.balance = foundWallet.balance

      foundWallet.set({
        balance: foundWallet.balance + dto.amount,
        last_credit_date: new Date()
      })
      await foundWallet.save({ session: trx })

      await pubsub.publish(events.wallet.credit, null, new TxnObj(dto), trx)

      // * Committing changes.
      await trx.commitTransaction()
      trx.endSession()

      return foundWallet
    } catch (exception) {
      // ! Exception thrown, roll back changes.
      await trx.abortTransaction()
      trx.endSession()

      throw exception
    }
  }

  async debitWallet (dto) {
    const trx = await startSession()
    try {
      // ! Starting transaction.
      trx.startTransaction()

      const foundWallet = await WalletDAO.findOne({ tenantId: dto.tenantId })
      dto.balance = foundWallet.balance

      if (foundWallet.balance < dto.amount) {
        throw new InsufficientError(
          'Insufficient funds to perform this transaction.'
        )
      }

      foundWallet.set({ balance: foundWallet.balance - dto.amount })
      await foundWallet.save({ session: trx })

      pubsub.publish(events.wallet.debit, null, new TxnObj(dto), trx)

      // * Committing changes.
      await trx.commitTransaction()
      trx.endSession()

      return foundWallet
    } catch (exception) {
      await trx.abortTransaction()
      trx.endSession()

      throw exception
    }
  }
}

export default new WalletService()

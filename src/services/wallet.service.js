import events from '../pubsub/events'
import pubsub from '../pubsub/PubSub'
import WalletDAO from '../daos/wallet.dao'

class WalletService {
  constructor () {
    pubsub.subscribe(events.tenant.signUp, this.createWallet)
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
    const foundWallet = await WalletDAO.findByField({ tenantId })

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
}

export default new WalletService()

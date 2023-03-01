import events from '../pubsub/events'
import pubsub from '../pubsub/PubSub'
import WalletDAO from '../daos/wallet.dao'

class WalletService {
  constructor () {
    pubsub.subscribe(events.tenant.signUp, this.createWallet)
  }

  async createWallet (newWalletDto, trx) {
    const newWallet = await WalletDAO.insert(newWalletDto, trx)

    return newWallet
  }

  async getWallets () {
    const foundWallets = await WalletDAO.findAll()
    const count = Intl.NumberFormat('en-US').format(foundWallets.length)

    return [count, foundWallets]
  }

  async getWallet (tenantId) {
    const foundWallet = await WalletDAO.findByField({ tenantId })

    return foundWallet
  }

  async updateWallet (tenantId, updateDto) {
    const updatedWallet = await WalletDAO.update({ tenantId }, updateDto)

    return updatedWallet
  }

  async deleteWallet (tenantId) {
    const deletedWallet = await WalletDAO.remove({ tenantId })

    return deletedWallet
  }
}

export default new WalletService()

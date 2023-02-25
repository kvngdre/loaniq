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
}

export default new WalletService()

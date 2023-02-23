import { tenant } from '../pubsub/events'
import { subscribe } from '../pubsub/PubSub'
import { insert } from '../daos/wallet.dao'

class WalletService {
  constructor () {
    subscribe(tenant.signUp, this.createWallet)
  }

  async createWallet (newWalletDto, trx) {
    const newWallet = await insert(newWalletDto, trx)

    return newWallet
  }
}

export default new WalletService()

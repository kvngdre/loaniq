import walletService from '../services/wallet.service'

class WalletController {
  static async createWallet (newWalletDto) {
    const newWallet = await walletService.createWallet(newWalletDto)

    return newWallet
  }
}

export default WalletController

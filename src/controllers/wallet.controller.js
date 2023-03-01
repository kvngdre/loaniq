import { httpCodes } from '../utils/constants'
import BaseController from './base.controller'
import walletService from '../services/wallet.service'
import walletValidator from '../validators/wallet.validator'
import ValidationError from '../errors/ValidationError'

class WalletController extends BaseController {
  static async createWallet (req, res) {
    const { value, error } = walletValidator.validateCreate(req.body)
    if (error) throw new ValidationError(error.message, error.path)

    const newWallet = await walletService.createWallet(value)
    const response = this.apiResponse('Wallet created.', newWallet)

    res.status(httpCodes.CREATED).json(response)
  }

  static async getWallets (req, res) {
    const [count, wallets] = await walletService.getWallets()
    const message = this.getMsgFromCount(count)

    const response = this.apiResponse(message, wallets)

    res.status(httpCodes.OK).json(response)
  }

  static async getWallet (req, res) {
    const wallet = await walletService.getWallet(req.params.walletId)
    const response = this.apiResponse('Fetched wallet.', wallet)

    res.status(httpCodes.OK).json(response)
  }

  static async updateWallet (req, res) {
    const { value, error } = walletValidator.validateUpdate(req.body)
    if (error) throw new ValidationError(error.message, error.path)

    const wallet = await walletService.updateWallet(req.params.id, value)
    const response = this.apiResponse('Wallet updated.', wallet)

    res.status(httpCodes.OK).json(response)
  }

  static async deleteWallet (req, res) {
    await walletService.deleteWallet(req.params.walletId)
    const response = this.apiResponse('Wallet deleted.')

    res.status(httpCodes.OK).json(response)
  }
}

export default WalletController

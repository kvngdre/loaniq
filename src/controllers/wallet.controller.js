import { httpCodes } from '../utils/constants'
import BaseController from './base.controller'
import walletService from '../services/wallet.service'
import walletValidator from '../validators/wallet.validator'
import ValidationError from '../errors/ValidationError'

class WalletController extends BaseController {
  static createWallet = async (req, res) => {
    const { value, error } = walletValidator.validateCreate(req.body, req.params.tenantId)
    if (error) throw new ValidationError(null, error)

    const newWallet = await walletService.createWallet(value)
    const response = this.apiResponse('Wallet created.', newWallet)

    res.status(httpCodes.CREATED).json(response)
  }

  static getWallets = async (req, res) => {
    const [count, wallets] = await walletService.getWallets()
    const message = this.getMsgFromCount(count)

    const response = this.apiResponse(message, wallets)

    res.status(httpCodes.OK).json(response)
  }

  static getWallet = async (req, res) => {
    const wallet = await walletService.getWallet(req.params.tenantId)
    const response = this.apiResponse('Fetched wallet.', wallet)

    res.status(httpCodes.OK).json(response)
  }

  static updateWallet = async (req, res) => {
    const { value, error } = walletValidator.validateUpdate(req.body)
    if (error) throw new ValidationError(null, error)

    const wallet = await walletService.updateWallet(req.params.tenantId, value)
    const response = this.apiResponse('Wallet updated.', wallet)

    res.status(httpCodes.OK).json(response)
  }

  static deleteWallet = async (req, res) => {
    await walletService.deleteWallet(req.params.tenantId)
    const response = this.apiResponse('Wallet deleted.')

    res.status(httpCodes.OK).json(response)
  }

  static getBalance = async (req, res) => {
    const balance = await walletService.getWalletBalance(req.params.tenantId)
    const response = this.apiResponse('Fetched wallet balance.', balance)

    res.status(httpCodes.OK).json(response)
  }

  static creditWallet = async (req, res) => {
    const { value, error } = walletValidator.validateCredit(req.params.tenantId, req.body)
    if (error) throw new ValidationError(null, error)

    const wallet = await walletService.creditWallet(value)
    const response = this.apiResponse('Wallet credited.', wallet)

    res.status(httpCodes.OK).json(response)
  }

  static debitWallet = async (req, res) => {
    const { value, error } = walletValidator.validateDebit(req.params.tenantId, req.body)
    if (error) throw new ValidationError(null, error)

    const wallet = await walletService.debitWallet(value)
    const response = this.apiResponse('Wallet debited.', wallet)

    res.status(httpCodes.OK).json(response)
  }
}

export default WalletController

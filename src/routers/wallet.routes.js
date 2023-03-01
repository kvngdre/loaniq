import { Router } from 'express'
import WalletController from '../controllers/wallet.controller'
import validateId from '../middleware/validateId'

const router = Router()

router.post('/', WalletController.createWallet)

router.get('/', WalletController.getWallets)

router.get('/:walletId', [validateId], WalletController.getWallet)

router.patch('/:walletId', [validateId], WalletController.updateWallet)

router.post('/:walletId', [validateId], WalletController.deleteWallet)

export default router

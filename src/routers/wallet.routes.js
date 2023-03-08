import { Router } from 'express'
import WalletController from '../controllers/wallet.controller'
import validateId from '../middleware/validateId'

const router = Router({ mergeParams: true })

router.post('/', [], WalletController.createWallet)

router.post('/credit', [validateId], WalletController.creditWallet)

router.post('/debit', [validateId], WalletController.debitWallet)

router.get('/a', [], WalletController.getWallets)

router.get('/', [validateId], WalletController.getWallet)

router.get('/balance', [validateId], WalletController.getBalance)

router.patch('/', [validateId], WalletController.updateWallet)

router.delete('/', [validateId], WalletController.deleteWallet)

export default router

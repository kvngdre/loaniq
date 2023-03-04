import { Router } from 'express'
import auth from '../middleware/auth'
import WalletController from '../controllers/wallet.controller'
import validateId from '../middleware/validateId'

const router = Router()

router.post('/', WalletController.createWallet)

router.post('/:tenantId/credit', [auth, validateId], WalletController.creditWallet)

router.post('/:tenantId/debit', [auth, validateId], WalletController.debitWallet)

router.get('/', WalletController.getWallets)

router.get('/:tenantId', [validateId], WalletController.getWallet)

router.get('/:tenantId/balance', [auth, validateId], WalletController.getBalance)

router.patch('/:tenantId', [validateId], WalletController.updateWallet)

router.delete('/:tenantId', [validateId], WalletController.deleteWallet)

export default router

import { roles } from '../config'
import { Router } from 'express'
import auth from '../middleware/auth'
import grantAccess from '../middleware/grantAccess'
import validateId from '../middleware/validateId'
import WalletController from '../controllers/wallet.controller'

const router = Router()

const { SUPER_ADMIN } = roles

router.post('/', [auth, grantAccess(SUPER_ADMIN)], WalletController.createWallet)

router.post('/:tenantId/credit', [auth, grantAccess(SUPER_ADMIN)], WalletController.creditWallet)

router.post('/:tenantId/debit', [auth, grantAccess(SUPER_ADMIN)], WalletController.debitWallet)

router.get('/', [auth, grantAccess(SUPER_ADMIN)], WalletController.getWallets)

router.get('/:tenantId', [auth, validateId, grantAccess('all')], WalletController.getWallet)

router.get('/:tenantId/balance', [auth, grantAccess('all')], WalletController.getBalance)

router.patch('/:tenantId', [auth, validateId, grantAccess(SUPER_ADMIN)], WalletController.updateWallet)

router.delete('/:tenantId', [auth, validateId, grantAccess(SUPER_ADMIN)], WalletController.deleteWallet)

export default router

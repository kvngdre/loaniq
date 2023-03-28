import { roles } from '../config'
import { Router } from 'express'
import verifyJWT from '../middleware/verifyJWT'
import grantAccess from '../middleware/grantAccess'
import validateId from '../middleware/validateId'
import WalletController from '../controllers/wallet.controller'

const router = Router()

const { SUPER_ADMIN } = roles

router.post('/', [verifyJWT, grantAccess(SUPER_ADMIN)], WalletController.createWallet)

router.post('/:tenantId/credit', [verifyJWT, grantAccess(SUPER_ADMIN)], WalletController.creditWallet)

router.post('/:tenantId/debit', [verifyJWT, grantAccess(SUPER_ADMIN)], WalletController.debitWallet)

router.get('/', [verifyJWT, grantAccess(SUPER_ADMIN)], WalletController.getWallets)

router.get('/:tenantId', [verifyJWT, validateId, grantAccess('all')], WalletController.getWallet)

router.get('/:tenantId/balance', [verifyJWT, grantAccess('all')], WalletController.getBalance)

router.patch('/:tenantId', [verifyJWT, validateId, grantAccess(SUPER_ADMIN)], WalletController.updateWallet)

router.delete('/:tenantId', [verifyJWT, validateId, grantAccess(SUPER_ADMIN)], WalletController.deleteWallet)

export default router

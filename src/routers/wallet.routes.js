import { roles } from '../config'
import { Router } from 'express'
import verifyJwt from '../middleware/verifyJwt'
import grantAccess from '../middleware/grantAccess'
import validateId from '../middleware/validateId'
import WalletController from '../controllers/wallet.controller'

const router = Router()

const { SUPER_ADMIN } = roles

router.post('/', [verifyJwt, grantAccess(SUPER_ADMIN)], WalletController.createWallet)

router.post('/:tenantId/credit', [verifyJwt, grantAccess(SUPER_ADMIN)], WalletController.creditWallet)

router.post('/:tenantId/debit', [verifyJwt, grantAccess(SUPER_ADMIN)], WalletController.debitWallet)

router.get('/', [verifyJwt, grantAccess(SUPER_ADMIN)], WalletController.getWallets)

router.get('/:tenantId', [verifyJwt, validateId, grantAccess('all')], WalletController.getWallet)

router.get('/:tenantId/balance', [verifyJwt, grantAccess('all')], WalletController.getBalance)

router.patch('/:tenantId', [verifyJwt, validateId, grantAccess(SUPER_ADMIN)], WalletController.updateWallet)

router.delete('/:tenantId', [verifyJwt, validateId, grantAccess(SUPER_ADMIN)], WalletController.deleteWallet)

export default router

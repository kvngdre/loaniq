import { roles } from '../config'
import { Router } from 'express'
import grantAccess from '../middleware/grantAccess'
import WalletController from '../controllers/wallet.controller'

const router = Router({ mergeParams: true })

const { SUPER_ADMIN } = roles

router.post('/', [grantAccess(SUPER_ADMIN)], WalletController.createWallet)

router.post('/credit', [grantAccess(SUPER_ADMIN)], WalletController.creditWallet)

router.post('/debit', [grantAccess(SUPER_ADMIN)], WalletController.debitWallet)

router.get('/', [ grantAccess(SUPER_ADMIN)], WalletController.getWallets)

router.get('/:tenantId', [grantAccess('all')], WalletController.getWallet)

router.get('/balance', [grantAccess('all')], WalletController.getBalance)

router.patch('/', [grantAccess(SUPER_ADMIN)], WalletController.updateWallet)

router.delete('/', [grantAccess(SUPER_ADMIN)], WalletController.deleteWallet)

export default router

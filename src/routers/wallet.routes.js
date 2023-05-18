import { roles } from '../config/index.js';
import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import grantAccess from '../middleware/grantAccess.js';
import validateObjectId from '../middleware/validateObjectId.js';
import WalletController from '../controllers/wallet.controller.js';

const router = Router();

const { SUPER_ADMIN } = roles;

router.post('/', [verifyJWT, grantAccess(SUPER_ADMIN)], WalletController.createWallet);

router.post('/:tenantId/credit', [verifyJWT, grantAccess(SUPER_ADMIN)], WalletController.creditWallet);

router.post('/:tenantId/debit', [verifyJWT, grantAccess(SUPER_ADMIN)], WalletController.debitWallet);

router.get('/', [verifyJWT, grantAccess(SUPER_ADMIN)], WalletController.getWallets);

router.get('/:tenantId', [verifyJWT, validateObjectId, grantAccess('all')], WalletController.getWallet);

router.get('/:tenantId/balance', [verifyJWT, grantAccess('all')], WalletController.getBalance);

router.patch('/:tenantId', [verifyJWT, validateObjectId, grantAccess(SUPER_ADMIN)], WalletController.updateWallet);

router.delete('/:tenantId', [verifyJWT, validateObjectId, grantAccess(SUPER_ADMIN)], WalletController.deleteWallet);

export default router;

import { Router } from 'express';
import WalletController from '../controllers/wallet.controller.js';
import validateObjectId from '../middleware/validateObjectId.js';
import verifyJWT from '../middleware/verifyJWT.js';

const router = Router();

router.post('/', verifyJWT, WalletController.createWallet);

router.post('/:tenantId/credit', verifyJWT, WalletController.creditWallet);

router.post('/:tenantId/debit', verifyJWT, WalletController.debitWallet);

router.get('/', verifyJWT, WalletController.getWallets);

router.get(
  '/:tenantId',
  verifyJWT,
  validateObjectId,
  WalletController.getWallet,
);

router.get('/:tenantId/balance', verifyJWT, WalletController.getBalance);

router.patch(
  '/:tenantId',
  verifyJWT,
  validateObjectId,
  WalletController.updateWallet,
);

router.delete(
  '/:tenantId',
  verifyJWT,
  validateObjectId,
  WalletController.deleteWallet,
);

export default router;

import { Router } from 'express';
import TransactionController from '../controllers/transaction.controller.js';
import verifyJWT from '../middleware/verifyJWT.js';

const router = Router();

router.post('/', [verifyJWT], TransactionController.createTxn);

router.get('/', [verifyJWT], TransactionController.getTxns);

router.get('/init', [verifyJWT], TransactionController.getPaymentLink);

router.get('/:txnId', [verifyJWT], TransactionController.getTxn);

router.patch('/:txnId', [verifyJWT], TransactionController.updateTxn);

router.delete('/:txnId', [verifyJWT], TransactionController.deleteTxn);

export default router;

import auth from '../middleware/auth'
import { Router } from 'express'
import TransactionController from '../controllers/transaction.controller'

const router = Router()

router.post('/', [auth], TransactionController.createTxn)

router.get('/', [auth], TransactionController.getTxns)

router.get('/init', [auth], TransactionController.getPaymentLink)

router.get('/:txnId', [auth], TransactionController.getTxn)

router.patch('/:txnId', [auth], TransactionController.updateTxn)

router.delete('/:txnId', [auth], TransactionController.deleteTxn)

export default router

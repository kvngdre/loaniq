import verifyJwt from '../middleware/verifyJwt'
import { Router } from 'express'
import TransactionController from '../controllers/transaction.controller'

const router = Router()

router.post('/', [verifyJwt], TransactionController.createTxn)

router.get('/', [verifyJwt], TransactionController.getTxns)

router.get('/init', [verifyJwt], TransactionController.getPaymentLink)

router.get('/:txnId', [verifyJwt], TransactionController.getTxn)

router.patch('/:txnId', [verifyJwt], TransactionController.updateTxn)

router.delete('/:txnId', [verifyJwt], TransactionController.deleteTxn)

export default router

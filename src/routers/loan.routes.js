import { Router } from 'express'
import verifyJWT from '../middleware/verifyJWT'
import LoanController from '../controllers/loan.controller'

const router = Router()

router.post('/', [verifyJWT], LoanController.createLoan)

router.get('/', [verifyJWT], LoanController.getLoans)

router.get('/:loanId', [verifyJWT], LoanController.getLoans)

router.patch('/:loanId', [verifyJWT], LoanController.updateLoan)

router.delete('/:loanId', [verifyJWT], LoanController.deleteLoan)

export default router

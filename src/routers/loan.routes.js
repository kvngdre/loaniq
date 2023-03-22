import { Router } from 'express'
import auth from '../middleware/auth'
import LoanController from '../controllers/loan.controller'

const router = Router()

router.post('/', [auth], LoanController.createLoan)

router.get('/', [auth], LoanController.getLoans)

router.get('/:loanId', [auth], LoanController.getLoans)

router.patch('/:loanId', [auth], LoanController.updateLoan)

router.delete('/:loanId', [auth], LoanController.deleteLoan)

export default router

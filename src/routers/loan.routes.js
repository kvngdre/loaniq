import { Router } from 'express'
import verifyJwt from '../middleware/verifyJwt'
import LoanController from '../controllers/loan.controller'

const router = Router()

router.post('/', [verifyJwt], LoanController.createLoan)

router.get('/', [verifyJwt], LoanController.getLoans)

router.get('/:loanId', [verifyJwt], LoanController.getLoans)

router.patch('/:loanId', [verifyJwt], LoanController.updateLoan)

router.delete('/:loanId', [verifyJwt], LoanController.deleteLoan)

export default router

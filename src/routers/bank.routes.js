import { Router } from 'express'
import BankController from '../controllers/bank.controller'
import validateId from '../middleware/validateId'
import verifyJwt from '../middleware/verifyJwt'

const router = Router()

router.post('/', [verifyJwt], BankController.createBank)

router.get('/', BankController.getBanks)

router.get('/:bankId', [verifyJwt, validateId], BankController.getBank)

router.patch('/:bankId', [verifyJwt, validateId], BankController.updateBank)

router.delete('/:bankId', [verifyJwt, validateId], BankController.deleteBank)

export default router

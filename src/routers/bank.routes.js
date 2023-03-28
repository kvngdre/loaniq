import { Router } from 'express'
import BankController from '../controllers/bank.controller'
import validateId from '../middleware/validateId'
import verifyJWT from '../middleware/verifyJWT'

const router = Router()

router.post('/', [verifyJWT], BankController.createBank)

router.get('/', BankController.getBanks)

router.get('/:bankId', [verifyJWT, validateId], BankController.getBank)

router.patch('/:bankId', [verifyJWT, validateId], BankController.updateBank)

router.delete('/:bankId', [verifyJWT, validateId], BankController.deleteBank)

export default router

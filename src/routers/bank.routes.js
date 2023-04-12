import { Router } from 'express'
import BankController from '../controllers/bank.controller.js'
import validateId from '../middleware/validateId.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = Router()

router.post('/', [verifyJWT], BankController.createBank)

router.get('/', BankController.getBanks)

router.get('/:bankId', [verifyJWT, validateId], BankController.getBank)

router.patch('/:bankId', [verifyJWT, validateId], BankController.updateBank)

router.delete('/:bankId', [verifyJWT, validateId], BankController.deleteBank)

export default router

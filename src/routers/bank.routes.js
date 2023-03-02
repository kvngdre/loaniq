import auth from '../middleware/auth'
import BankController from '../controllers/bank.controller'
import Router from 'express'
import validateObjectId from '../middleware/validateId'

const router = Router()

router.post('/', [auth], BankController.createBank)

router.get('/', BankController.getBanks)

router.get('/:bankId', [auth, validateObjectId], BankController.getBank)

router.patch('/:bankId', [auth, validateObjectId], BankController.updateBank)

router.delete('/:bankId', [auth, validateObjectId], BankController.deleteBank)

export default router

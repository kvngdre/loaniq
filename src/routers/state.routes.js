import auth from '../middleware/auth'
import { Router } from 'express'
import StateController from '../controllers/state.controller'
import validateId from '../middleware/validateId'

const router = Router()

router.post('/', [auth], StateController.createState)

router.get('/', StateController.getStates)

router.get('/:stateId', [auth, validateId], StateController.getState)

router.patch('/:stateId', [auth, validateId], StateController.updateState)

router.delete('/:stateId', [auth, validateId], StateController.deleteState)

export default router

import verifyJwt from '../middleware/verifyJwt'
import { Router } from 'express'
import StateController from '../controllers/state.controller'
import validateId from '../middleware/validateId'

const router = Router()

router.post('/', [verifyJwt], StateController.createState)

router.get('/', StateController.getStates)

router.get('/:stateId', [verifyJwt, validateId], StateController.getState)

router.patch('/:stateId', [verifyJwt, validateId], StateController.updateState)

router.delete('/:stateId', [verifyJwt, validateId], StateController.deleteState)

export default router

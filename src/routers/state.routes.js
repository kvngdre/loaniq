import { Router } from 'express'
import StateController from '../controllers/state.controller.js'
import validateId from '../middleware/validateId.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = Router()

router.post('/', [verifyJWT], StateController.createState)

router.get('/', StateController.getStates)

router.get('/:stateId', [verifyJWT, validateId], StateController.getState)

router.patch('/:stateId', [verifyJWT, validateId], StateController.updateState)

router.delete('/:stateId', [verifyJWT, validateId], StateController.deleteState)

export default router

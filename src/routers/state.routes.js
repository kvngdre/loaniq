import { Router } from 'express';
import StateController from '../controllers/state.controller.js';
import validateObjectId from '../middleware/validateObjectId.js';
import verifyJWT from '../middleware/verifyJWT.js';

const router = Router();

router.post('/', [verifyJWT], StateController.createState);

router.get('/', StateController.getStates);

router.get('/:stateId', [verifyJWT, validateObjectId], StateController.getState);

router.patch('/:stateId', [verifyJWT, validateObjectId], StateController.updateState);

router.delete('/:stateId', [verifyJWT, validateObjectId], StateController.deleteState);

export default router;

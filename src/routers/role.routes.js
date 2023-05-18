import { Router } from 'express';
import RoleController from '../controllers/role.controller.js';
import validateObjectId from '../middleware/validateObjectId.js';
import verifyJWT from '../middleware/verifyJWT.js';

const router = Router();

router.post('/', verifyJWT, RoleController.create);

router.get('/', verifyJWT, RoleController.getRoles);

router.get('/:roleId', verifyJWT, validateObjectId, RoleController.getRole);

router.patch('/:roleId', verifyJWT, validateObjectId, RoleController.updateRole);

router.delete('/:roleId', verifyJWT, validateObjectId, RoleController.deleteRole);

export default router;

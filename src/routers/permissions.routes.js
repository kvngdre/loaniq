import { Router } from 'express'
import verifyJWT from '../middleware/verifyJWT.js'
import PermissionController from '../controllers/permission.controller.js'
import validateObjectId from '../middleware/validateObjectId.js'

const router = Router()

router.post('/', [verifyJWT], PermissionController.create)

router.get('/', [verifyJWT], PermissionController.getPermissions)

router.get('/:permissionId', [verifyJWT, validateObjectId], PermissionController.getPermission)

router.patch('/:permissionId', [verifyJWT, validateObjectId], PermissionController.updatePermission)

router.delete('/:permissionId', [verifyJWT, validateObjectId], PermissionController.deletePermission)

export default router

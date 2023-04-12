import { Router } from 'express'
import verifyJWT from '../middleware/verifyJWT.js'
import PermissionController from '../controllers/permission.controller.js'
import validateId from '../middleware/validateId.js'

const router = Router()

router.post('/', [verifyJWT], PermissionController.create)

router.get('/', [verifyJWT], PermissionController.getPermissions)

// router.get('/:reviewId', [verifyJWT, validateId], PermissionController.getReview)

// router.patch('/:reviewId', [verifyJWT, validateId], PermissionController.updateReview)

// router.delete('/:reviewId', [verifyJWT, validateId], PermissionController.deleteReview)

export default router

import { Router } from 'express'
import verifyJWT from '../middleware/verifyJWT.js'
import RoleController from '../controllers/role.controller.js'
import validateObjectId from '../middleware/validateObjectId.js'

const router = Router()

router.post('/', [verifyJWT], RoleController.create)

router.get('/', [verifyJWT], RoleController.getRoles)

// router.get('/:reviewId', [verifyJWT, validateObjectId], RoleController.getReview)

// router.patch('/:reviewId', [verifyJWT, validateObjectId], RoleController.updateReview)

// router.delete('/:reviewId', [verifyJWT, validateObjectId], RoleController.deleteReview)

export default router

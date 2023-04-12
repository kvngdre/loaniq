import { Router } from 'express'
import verifyJWT from '../middleware/verifyJWT.js'
import RoleController from '../controllers/role.controller.js'
import validateId from '../middleware/validateId.js'

const router = Router()

router.post('/', [verifyJWT], RoleController.create)

router.get('/', [verifyJWT], RoleController.getRoles)

// router.get('/:reviewId', [verifyJWT, validateId], RoleController.getReview)

// router.patch('/:reviewId', [verifyJWT, validateId], RoleController.updateReview)

// router.delete('/:reviewId', [verifyJWT, validateId], RoleController.deleteReview)

export default router

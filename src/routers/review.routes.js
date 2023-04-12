import { Router } from 'express'
import verifyJWT from '../middleware/verifyJWT.js'
import grantAccess from '../middleware/grantAccess.js'
import ReviewController from '../controllers/review.controller.js'
import validateId from '../middleware/validateId.js'

const router = Router()

router.post('/', [verifyJWT, grantAccess('all')], ReviewController.createReview)

router.get('/', [verifyJWT, grantAccess('all')], ReviewController.getReviews)

router.get('/:reviewId', [verifyJWT, validateId, grantAccess('all')], ReviewController.getReview)

router.patch('/:reviewId', [verifyJWT, validateId, grantAccess('all')], ReviewController.updateReview)

router.delete('/:reviewId', [verifyJWT, validateId, grantAccess('all')], ReviewController.deleteReview)

export default router

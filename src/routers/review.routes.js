import { Router } from 'express'
import ReviewController from '../controllers/review.controller.js'
import validateId from '../middleware/validateId.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = Router()

router.post('/', [verifyJWT], ReviewController.createReview)

router.get('/', [verifyJWT], ReviewController.getReviews)

router.get('/:reviewId', [verifyJWT, validateId], ReviewController.getReview)

router.patch('/:reviewId', [verifyJWT, validateId], ReviewController.updateReview)

router.delete('/:reviewId', [verifyJWT, validateId], ReviewController.deleteReview)

export default router

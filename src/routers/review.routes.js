import { Router } from 'express'
import verifyJwt from '../middleware/verifyJwt'
import grantAccess from '../middleware/grantAccess'
import ReviewController from '../controllers/review.controller.js'
import validateId from '../middleware/validateId'

const router = Router()

router.post('/', [verifyJwt, grantAccess('all')], ReviewController.createReview)

router.get('/', [verifyJwt, grantAccess('all')], ReviewController.getReviews)

router.get('/:reviewId', [verifyJwt, validateId, grantAccess('all')], ReviewController.getReview)

router.patch('/:reviewId', [verifyJwt, validateId, grantAccess('all')], ReviewController.updateReview)

router.delete('/:reviewId', [verifyJwt, validateId, grantAccess('all')], ReviewController.deleteReview)

export default router

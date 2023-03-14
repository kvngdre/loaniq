import { Router } from 'express'
import auth from '../middleware/auth'
import grantAccess from '../middleware/grantAccess'
import ReviewController from '../controllers/review.controller.js'
import validateId from '../middleware/validateId'

const router = Router()

router.post('/', [auth, grantAccess('all')], ReviewController.createReview)

router.get('/', [auth, grantAccess('all')], ReviewController.getReviews)

router.get('/:reviewId', [auth, validateId, grantAccess('all')], ReviewController.getReview)

router.patch('/:reviewId', [auth, validateId, grantAccess('all')], ReviewController.updateReview)

router.delete('/:reviewId', [auth, validateId, grantAccess('all')], ReviewController.deleteReview)

export default router

import { Router } from 'express'
import grantAccess from '../middleware/grantAccess'
import ReviewController from '../controllers/review.controller.js'
import validateId from '../middleware/validateId'
import finder from '../middleware/finder'

const router = Router({ mergeParams: true })

router.post('/', [grantAccess('all')], ReviewController.createReview)

router.get('/', [grantAccess('all')], ReviewController.getReviews)

router.get('/:reviewId', [validateId, grantAccess('all')], ReviewController.getReview)

router.patch('/:reviewId', [validateId, grantAccess('all')], ReviewController.updateReview)

router.delete('/:reviewId', [validateId, grantAccess('all')], ReviewController.deleteReview)

export default router

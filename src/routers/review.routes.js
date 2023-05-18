import { Router } from 'express';
import ReviewController from '../controllers/review.controller.js';
import validateObjectId from '../middleware/validateObjectId.js';
import verifyJWT from '../middleware/verifyJWT.js';

const router = Router();

router.post('/', [verifyJWT], ReviewController.createReview);

router.get('/', [verifyJWT], ReviewController.getReviews);

router.get('/:reviewId', [verifyJWT, validateObjectId], ReviewController.getReview);

router.patch('/:reviewId', [verifyJWT, validateObjectId], ReviewController.updateReview);

router.delete('/:reviewId', [verifyJWT, validateObjectId], ReviewController.deleteReview);

export default router;

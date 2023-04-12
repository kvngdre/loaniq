import { Router } from 'express'
import segConfigRoutes from './segConfig.routes.js'
import SegmentController from '../controllers/segment.controller.js'
import validateId from '../middleware/validateId.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = Router()

router.use('/configurations', segConfigRoutes)

router.post('/', [verifyJWT], SegmentController.createSegment)

router.get('/', [verifyJWT], SegmentController.getSegments)

router.get('/:segmentId', [verifyJWT, validateId], SegmentController.getSegment)

router.patch('/:segmentId', [verifyJWT, validateId], SegmentController.updateSegment)

router.delete('/:segmentId', [verifyJWT, validateId], SegmentController.deleteSegment)

export default router

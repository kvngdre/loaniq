import verifyJWT from '../middleware/verifyJWT'
import { Router } from 'express'
import SegmentController from '../controllers/segment.controller'
import segConfigRoutes from './segConfig.routes'
import validateId from '../middleware/validateId'

const router = Router()

router.use('/configurations', segConfigRoutes)

router.post('/', [verifyJWT], SegmentController.createSegment)

router.get('/', [verifyJWT], SegmentController.getSegments)

router.get('/:segmentId', [verifyJWT, validateId], SegmentController.getSegment)

router.patch('/:segmentId', [verifyJWT, validateId], SegmentController.updateSegment)

router.delete('/:segmentId', [verifyJWT, validateId], SegmentController.deleteSegment)

export default router

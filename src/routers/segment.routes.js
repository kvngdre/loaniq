import verifyJwt from '../middleware/verifyJwt'
import { Router } from 'express'
import SegmentController from '../controllers/segment.controller'
import segConfigRoutes from './segConfig.routes'
import validateId from '../middleware/validateId'

const router = Router()

router.use('/configurations', segConfigRoutes)

router.post('/', [verifyJwt], SegmentController.createSegment)

router.get('/', [verifyJwt], SegmentController.getSegments)

router.get('/:segmentId', [verifyJwt, validateId], SegmentController.getSegment)

router.patch('/:segmentId', [verifyJwt, validateId], SegmentController.updateSegment)

router.delete('/:segmentId', [verifyJwt, validateId], SegmentController.deleteSegment)

export default router

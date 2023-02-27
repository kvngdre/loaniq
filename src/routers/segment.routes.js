import auth from '../middleware/auth'
import Router from 'express'
import SegmentController from '../controllers/segment.controller'
import segConfigRoutes from './segConfig.routes'
import validateId from '../middleware/validateId'

const router = Router()

router.use('/configurations', segConfigRoutes)

router.post('/', [auth], SegmentController.createSegment)

router.get('/', [auth], SegmentController.getSegments)

router.get('/:segmentId', [auth, validateId], SegmentController.getSegment)

router.patch('/:segmentId', [auth, validateId], SegmentController.updateSegment)

router.delete('/:segmentId', [auth, validateId], SegmentController.deleteSegment)

export default router

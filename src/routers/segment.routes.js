import auth from '../middleware/auth'
import Router from 'express'
import SegmentController from '../controllers/segmentController'

const router = Router()

router.post('/', [auth], SegmentController.createSegment)

router.get('/', [auth], SegmentController.getSegments)

router.get('/:segmentId', [auth], SegmentController.getSegment)

router.patch('/:segmentId', [auth], SegmentController.updateSegment)

router.delete('/:id', [auth], SegmentController.deleteSegment)

export default router

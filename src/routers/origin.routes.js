import OriginController from '../controllers/origin.controller.js'
import { Router } from 'express'

const router = Router()

router.get('/:loaneeId', OriginController.getOne)

export default router

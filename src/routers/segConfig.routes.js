import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import SegConfigController from '../controllers/segConfig.controller.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = Router();

router.post('/', [verifyJWT], SegConfigController.createSegConfig);

router.get('/', SegConfigController.getSegConfigs);

router.get('/:segConfigId', [validateObjectId], SegConfigController.getSegConfig);

router.patch('/:segConfigId', [validateObjectId], SegConfigController.updateConfig);

router.delete('/:segConfigId', [validateObjectId], SegConfigController.deleteSegConfig);

export default router;

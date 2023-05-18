import { Router } from 'express';
import UserConfigController from '../controllers/userConfig.controller.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = Router({ mergeParams: true });

router.post('/', [], UserConfigController.createConfig);

router.get('/', [], UserConfigController.getUserConfigs);

router.get('/:userId', [validateObjectId], UserConfigController.getUserConfig);

router.patch('/:userId', [validateObjectId], UserConfigController.updateUserConfig);

router.delete('/:userId', [validateObjectId], UserConfigController.deleteUserConfig);

export default router;

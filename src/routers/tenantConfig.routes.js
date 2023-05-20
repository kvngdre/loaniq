import { Router } from 'express';
import checkPermission from '../middleware/checkPermission.js';
import validateObjectId from '../middleware/validateObjectId.js';
import verifyJWT from '../middleware/verifyJWT.js';
import TenantConfigController from '../tenant-configurations/tenantConfig.controller.js';

const router = Router();

router.post(
  '/',
  verifyJWT,
  checkPermission('createAny', 'tenantConfig'),
  TenantConfigController.createConfig,
);

router.get(
  '/',
  verifyJWT,
  checkPermission('viewAny', 'tenantConfig'),
  TenantConfigController.getConfigs,
);

router.get(
  '/:tenantId',
  verifyJWT,
  validateObjectId,
  checkPermission('viewOwn', 'tenantConfig'),
  TenantConfigController.getConfig,
);

router.patch(
  '/:tenantId',
  verifyJWT,
  validateObjectId,
  checkPermission('updateOwn', 'tenantConfig'),
  TenantConfigController.updateConfig,
);

router.delete(
  '/:tenantId',
  verifyJWT,
  validateObjectId,
  checkPermission('deleteAny', 'tenantConfig'),
  TenantConfigController.deleteConfig,
);

export default router;

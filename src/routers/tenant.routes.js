// import { requiresAuth } from 'express-openid-connect'
import { Router } from 'express';
import checkPermission from '../middleware/checkPermission.js';
import upload from '../middleware/fileUploader.js';
import validateObjectId from '../middleware/validateObjectId.js';
import verifyJWT from '../middleware/verifyJWT.js';
import TenantController from '../tenant/tenant.controller.js';
import tenantConfigRoutes from './tenantConfig.routes.js';
import walletRoutes from './wallet.routes.js';

const router = Router();
const tenantController = new TenantController();

router.use('/configurations', tenantConfigRoutes);

router.use('/wallet', walletRoutes);

router.post('/sign-up', tenantController.signUp);

router.post(
  '/:tenantId/request-activation',
  verifyJWT,
  validateObjectId,
  checkPermission('requestToActivate', 'tenant'),
  tenantController.requestTenantActivation,
);

router.post(
  '/:tenantId/onboard',
  verifyJWT,
  validateObjectId,
  checkPermission('onBoardOwn', 'tenant'),
  tenantController.onBoardTenant,
);

router.post(
  '/:tenantId/uploads',
  verifyJWT,
  validateObjectId,
  checkPermission('uploadDocs', 'tenant'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'documents', maxCount: 5 },
  ]),
  tenantController.uploadFiles,
);

router.get('/forms/:formId', tenantController.getPublicFormData);

router.get(
  '/self',
  verifyJWT,
  checkPermission('view', 'tenant'),
  tenantController.getCurrentTenant,
);

router.get(
  '/',
  verifyJWT,
  checkPermission('viewAll', 'tenant'),
  tenantController.getTenants,
);

router.get(
  '/:tenantId',
  verifyJWT,
  validateObjectId,
  checkPermission('view', 'tenant'),
  tenantController.getTenant,
);

router.get(
  '/:tenantId/deactivate',
  verifyJWT,
  validateObjectId,
  checkPermission('deactivate', 'tenant'),
  tenantController.requestToDeactivateTenant,
);

router.get(
  '/:tenantId/public-url',
  verifyJWT,
  validateObjectId,
  checkPermission('generateUrl', 'tenant'),
  tenantController.generatePublicUrl,
);

router.get(
  '/:tenantId/reactivate',
  verifyJWT,
  validateObjectId,
  checkPermission('reactivate', 'tenant'),
  tenantController.reactivateTenant,
);

router.get(
  '/:tenantId/request-deactivation',
  verifyJWT,
  validateObjectId,
  checkPermission('requestToDeactivate', 'tenant'),
  tenantController.requestTenantActivation,
);

router.patch(
  '/:tenantId',
  verifyJWT,
  validateObjectId,
  checkPermission('update', 'tenant'),
  tenantController.updateTenant,
);

router.delete(
  '/:tenantId',
  verifyJWT,
  validateObjectId,
  checkPermission('delete', 'tenant'),
  tenantController.deleteTenant,
);

export default router;

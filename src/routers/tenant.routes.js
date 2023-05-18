// import { requiresAuth } from 'express-openid-connect'
import { Router } from 'express';
import checkPermission from '../middleware/checkPermission.js';
import upload from '../middleware/fileUploader.js';
import validateObjectId from '../middleware/validateObjectId.js';
import verifyJWT from '../middleware/verifyJWT.js';
import tenantController from '../tenant/tenant.controller.js';
import tenantConfigRoutes from './tenantConfig.routes.js';
import walletRoutes from './wallet.routes.js';

const router = Router();

router.use('/configurations', tenantConfigRoutes);

router.use('/wallets', walletRoutes);

router.post('/sign-up', tenantController.signUp);

router.post(
  '/:tenantId/activate',
  verifyJWT,
  validateObjectId,
  checkPermission('submitToActivateOwn', 'tenant'),
  tenantController.requestTenantActivation,
);

router.post(
  '/:tenantId/deactivate',
  verifyJWT,
  validateObjectId,
  checkPermission('requestToDeactivateOwn', 'tenant'),
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
  checkPermission('viewOwn', 'tenant'),
  tenantController.getCurrentTenant,
);

router.get(
  '/',
  verifyJWT,
  checkPermission('viewAny', 'tenant'),
  tenantController.getTenants,
);

router.get(
  '/:tenantId',
  verifyJWT,
  validateObjectId,
  checkPermission('viewOwn', 'tenant'),
  tenantController.getTenant,
);

router.get(
  '/:tenantId/deactivate',
  verifyJWT,
  validateObjectId,
  checkPermission('deactivateAny', 'tenant'),
  tenantController.requestToDeactivateTenant,
);

router.get(
  '/:tenantId/public-url',
  verifyJWT,
  validateObjectId,
  checkPermission('generateOwnUrl', 'tenant'),
  tenantController.generatePublicUrl,
);

router.get(
  '/:tenantId/reactivate',
  verifyJWT,
  validateObjectId,
  checkPermission('reactivateOwn', 'tenant'),
  tenantController.reactivateTenant,
);

router.patch(
  '/:tenantId',
  verifyJWT,
  validateObjectId,
  checkPermission('updateOwn', 'tenant'),
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

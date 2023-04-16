// import { requiresAuth } from 'express-openid-connect'
import { Router } from 'express'
import checkPermission from '../middleware/checkPermission.js'
import tenantConfigRoutes from './tenantConfig.routes.js'
import TenantController from '../controllers/tenant.controller.js'
import upload from '../middleware/fileUploader.js'
import validateObjectId from '../middleware/validateObjectId.js'
import verifyJWT from '../middleware/verifyJWT.js'
import walletRoutes from './wallet.routes.js'

const router = Router()

router.use('/configurations', tenantConfigRoutes)

router.use('/wallets', walletRoutes)

router.post('/sign-up', TenantController.signUp)

router.post(
  '/:tenantId/activate',
  verifyJWT,
  validateObjectId,
  checkPermission('submitToActivateOwn', 'tenant'),
  TenantController.submitDocsToActivateTenant
)

router.post(
  '/:tenantId/deactivate',
  verifyJWT,
  validateObjectId,
  checkPermission('requestToDeactivateOwn', 'tenant'),
  TenantController.submitDocsToActivateTenant
)

router.post(
  '/:tenantId/onboard',
  verifyJWT,
  validateObjectId,
  checkPermission('onBoardOwn', 'tenant'),
  TenantController.onBoardTenant
)

router.post(
  '/:tenantId/uploads',
  verifyJWT,
  validateObjectId,
  checkPermission('uploadDocs', 'tenant'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'documents', maxCount: 5 }
  ]),
  TenantController.uploadFiles
)

router.get('/forms/:formId', TenantController.getPublicFormData)

router.get(
  '/self',
  verifyJWT,
  checkPermission('viewOwn', 'tenant'),
  TenantController.getCurrentTenant
)

router.get(
  '/',
  verifyJWT,
  checkPermission('viewAny', 'tenant'),
  TenantController.getTenants
)

router.get(
  '/:tenantId',
  verifyJWT,
  validateObjectId,
  checkPermission('viewOwn', 'tenant'),
  TenantController.getTenant
)

router.get(
  '/:tenantId/deactivate',
  verifyJWT,
  validateObjectId,
  checkPermission('deactivateAny', 'tenant'),
  TenantController.requestToDeactivateTenant
)

router.get(
  '/:tenantId/public-url',
  verifyJWT,
  validateObjectId,
  checkPermission('generateOwnUrl', 'tenant'),
  TenantController.generatePublicUrl
)

router.get(
  '/:tenantId/reactivate',
  verifyJWT,
  validateObjectId,
  checkPermission('reactivateOwn', 'tenant'),
  TenantController.reactivateTenant
)

router.patch(
  '/:tenantId',
  verifyJWT,
  validateObjectId,
  checkPermission('updateOwn', 'tenant'),
  TenantController.updateTenant
)

router.delete(
  '/:tenantId',
  verifyJWT,
  validateObjectId,
  checkPermission('delete', 'tenant'),
  TenantController.deleteTenant
)

export default router

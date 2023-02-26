import { userRoles } from '../utils/constants'
import auth from '../middleware/auth'
import Router from 'express'
import upload from '../middleware/fileUpload'
import validateId from '../middleware/validateId'
import verifyRole from '../middleware/verifyRole'
import TenantController from '../controllers/tenant.controller'
import tenantConfigRoutes from './tenantConfig.routes'
import walletRoutes from './wallet.routes'

const router = Router()

router.use('/configurations', tenantConfigRoutes)

router.use('/wallets', walletRoutes)

router.post('/sign_up', TenantController.signUp)

router.post('/:tenantId/activate', [validateId], TenantController.activateTenant)

router.post('/:tenantId/deactivate', [validateId], TenantController.deactivateTenant)

router.get('/', TenantController.getTenants)

router.get('/mine', TenantController.getCurrentTenant)

router.get('/:tenantId/reactivate', [validateId], TenantController.reactivateTenant)

router.get('/:tenantId', [validateId], TenantController.getTenants)

router.patch('/:tenantId', [validateId], TenantController.updateTenant)

router.delete('/:tenantId', [validateId], TenantController.deleteTenant)

// router.post('/upload/logo', [upload.single('logo')], (req, res) => {
//   console.log(req.file)
//   return res.json({
//     message: 'file uploaded'
//   })
// })

// router.get('/forms/:shortUrl', async (req, res) => {
//   const response = await lenderController.getPublicFormData(
//     req.params.shortUrl
//   )
//   return res.status(response.code).json(response.payload)
// })

// router.get(
//   '/public-url/:id?',
//   [auth, validateObjectId],
//   async (req, res) => {
//     const lender =
//             req.params.id !== undefined ? req.params.id : req.user.lender

//     const publicUrl = await lenderController.genPublicUrl(lender)
//     if (publicUrl instanceof ServerError) { return res.status(publicUrl.errorCode).json(publicUrl.message) }

//     return res.status(200).json(publicUrl)
//   }
// )

export default router

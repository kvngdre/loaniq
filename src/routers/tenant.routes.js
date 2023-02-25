import { userRoles } from '../utils/constants'
import auth from '../middleware/verifyToken'
import Router from 'express'
import upload from '../middleware/fileUpload'
import validateObjectId from '../middleware/validateObjectId'
import verifyRole from '../middleware/verifyRole'
import TenantController from '../controllers/tenant.controller'
import tenantConfigRoutes from './tenantConfig.routes'
import walletRoutes from './wallet.routes'

const router = Router()

router.use('/configurations', tenantConfigRoutes)

router.use('/wallets', walletRoutes)

router.post('/sign_up', TenantController.signUp)

router.post('/activate/:tenantId', TenantController.activateTenant)

router.get('/', TenantController.getTenants)

router.get('/mine', TenantController.getCurrentTenant)

router.get('/reactivate/:tenantId', TenantController.reactivateTenant)

router.get('/:tenantId', TenantController.getTenants)

router.patch('/:tenantId', TenantController.updateTenant)

router.post('activate/:tenantId', TenantController.activateTenant)

router.post('deactivate/:tenantId', TenantController.deactivateTenant)

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

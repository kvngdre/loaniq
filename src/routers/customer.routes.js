import { Router } from 'express'
import CustomerController from '../controllers/customer.controller.js'
import grantAccess from '../middleware/grantAccess.js'
import upload from '../middleware/fileUploader.js'
import validateId from '../middleware/validateId.js'

const router = Router({ mergeParams: true })

router.post('/', [grantAccess('all')], CustomerController.createCustomer)

router.get('/', [grantAccess('all')], CustomerController.getCustomers)

router.get(
  '/:customerId',
  [validateId, grantAccess('all')],
  CustomerController.getCustomer
)

router.patch(
  '/:customerId',
  [validateId, grantAccess('all')],
  CustomerController.updateCustomer
)

router.delete(
  '/:customerId',
  [validateId, grantAccess('all')],
  CustomerController.deleteCustomer
)

router.post(
  '/:customerId/uploads',
  [
    validateId,
    grantAccess('all'),
    upload.fields([{ name: 'passport' }, { name: 'id_card' }])
  ],
  CustomerController.uploadDocs
)

export default router

import { Router } from 'express'
import CustomerController from '../controllers/customer.controller'
import grantAccess from '../middleware/grantAccess'
import upload from '../middleware/fileUploader'
import validateId from '../middleware/validateId'

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

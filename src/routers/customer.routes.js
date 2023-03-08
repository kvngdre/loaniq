import auth from '../middleware/auth'
import CustomerController from '../controllers/customer.controller'
import { Router } from 'express'
import upload from '../middleware/fileUploader'
import validateId from '../middleware/validateId'

const router = Router()

router.post('/', [auth], CustomerController.createCustomer)

router.get('/', [auth], CustomerController.getCustomers)

router.get('/:customerId', [auth, validateId], CustomerController.getCustomer)

router.patch(
  '/:customerId',
  [auth, validateId],
  CustomerController.updateCustomer
)

router.delete('/:customerId', [auth, validateId], CustomerController.deleteCustomer)

router.post(
  '/:customerId/uploads',
  [
    auth,
    validateId,
    upload.fields([{ name: 'passport' }, { name: 'id_card' }])
  ],
  CustomerController.uploadDocs
)

export default router

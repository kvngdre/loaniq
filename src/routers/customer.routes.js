import { Router } from 'express';
import CustomerController from '../controllers/customer.controller.js';
import upload from '../middleware/fileUploader.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = Router({ mergeParams: true });

router.post('/', CustomerController.createCustomer);

router.get('/', CustomerController.getCustomers);

router.get('/:customerId', validateObjectId, CustomerController.getCustomer);

router.patch(
  '/:customerId',
  validateObjectId,
  CustomerController.updateCustomer,
);

router.delete(
  '/:customerId',
  validateObjectId,
  CustomerController.deleteCustomer,
);

router.post(
  '/:customerId/uploads',
  validateObjectId,
  upload.fields([{ name: 'passport' }, { name: 'id_card' }]),
  CustomerController.uploadDocs,
);

export default router;

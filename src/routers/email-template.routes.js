import { Router } from 'express';
import EmailTemplateController from '../controllers/email-template.controller.js';
import validateObjectId from '../middleware/validateObjectId.js';
import verifyJWT from '../middleware/verifyJWT.js';

const router = Router();

router.post('/', EmailTemplateController.createTemplate);

router.get('/', EmailTemplateController.getTemplates);

router.get(
  '/:templateId',
  verifyJWT,
  validateObjectId,
  EmailTemplateController.getTemplate,
);

router.patch(
  '/:templateId',
  verifyJWT,
  validateObjectId,
  EmailTemplateController.updateTemplate,
);

router.delete(
  '/:templateId',
  verifyJWT,
  validateObjectId,
  EmailTemplateController.deleteTemplate,
);

export default router;

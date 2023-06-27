import { Router } from "express";
import validateObjectId from "../middleware/validate-id.middleware.js";
import verifyJWT from "../middleware/verify-jwt.middleware.js";
import EmailTemplateController from "../web/controllers/email-template.controller.js";

const router = Router();

router.post("/", EmailTemplateController.createTemplate);

router.get("/", EmailTemplateController.getTemplates);

router.get(
  "/:templateId",
  verifyJWT,
  validateObjectId,
  EmailTemplateController.getTemplate,
);

router.patch(
  "/:templateId",
  verifyJWT,
  validateObjectId,
  EmailTemplateController.updateTemplate,
);

router.delete(
  "/:templateId",
  verifyJWT,
  validateObjectId,
  EmailTemplateController.deleteTemplate,
);

export default router;

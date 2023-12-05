import { Router } from "express";

import { EmailTemplateController } from "../controllers/index.js";
import { ValidateRequest } from "../middleware/index.js";
import {
  createEmailTemplateValidator,
  editEmailTemplateValidator,
  idValidator,
} from "../validators/index.js";

export const emailTemplateRouter = Router();

emailTemplateRouter.post(
  "/",
  ValidateRequest.with(createEmailTemplateValidator),
  EmailTemplateController.create,
);

emailTemplateRouter.get("/", EmailTemplateController.index);

emailTemplateRouter.get(
  "/:id",
  ValidateRequest.with(idValidator),
  EmailTemplateController.show,
);

emailTemplateRouter.patch(
  "/:id",
  ValidateRequest.with(editEmailTemplateValidator),
  EmailTemplateController.edit,
);

emailTemplateRouter.delete(
  "/:id",
  ValidateRequest.with(idValidator),
  EmailTemplateController.destroy,
);

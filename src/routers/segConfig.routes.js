import { Router } from "express";
import validateObjectId from "../middleware/validate-id.middleware.js";
import verifyJWT from "../middleware/verify-jwt.middleware.js";
import SegConfigController from "../web/controllers/segConfig.controller.js";

const router = Router();

router.post("/", [verifyJWT], SegConfigController.createSegConfig);

router.get("/", SegConfigController.getSegConfigs);

router.get(
  "/:segConfigId",
  [validateObjectId],
  SegConfigController.getSegConfig,
);

router.patch(
  "/:segConfigId",
  [validateObjectId],
  SegConfigController.updateConfig,
);

router.delete(
  "/:segConfigId",
  [validateObjectId],
  SegConfigController.deleteSegConfig,
);

export default router;

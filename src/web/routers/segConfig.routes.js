import { Router } from "express";
import SegConfigController from "../controllers/segConfig.controller.js";
import validateObjectId from "../middleware/validate-id.middleware.js";
import verifyJWT from "../middleware/verify-jwt.middleware.js";

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

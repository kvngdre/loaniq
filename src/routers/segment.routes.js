import { Router } from "express";
import validateObjectId from "../middleware/validate-id.middleware.js";
import verifyJWT from "../middleware/verify-jwt.middleware.js";
import SegmentController from "../web/controllers/segment.controller.js";
import segConfigRoutes from "./segConfig.routes.js";

const router = Router();

router.use("/configurations", segConfigRoutes);

router.post("/", [verifyJWT], SegmentController.createSegment);

router.get("/", [verifyJWT], SegmentController.getSegments);

router.get(
  "/:segmentId",
  [verifyJWT, validateObjectId],
  SegmentController.getSegment,
);

router.patch(
  "/:segmentId",
  [verifyJWT, validateObjectId],
  SegmentController.updateSegment,
);

router.delete(
  "/:segmentId",
  [verifyJWT, validateObjectId],
  SegmentController.deleteSegment,
);

export default router;

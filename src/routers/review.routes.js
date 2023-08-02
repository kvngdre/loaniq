import { Router } from "express";
import validateObjectId from "../middleware/validate-id.middleware.js";
import verifyJWT from "../middleware/verify-jwt.middleware.js";
import ReviewController from "../web/controllers/review.controller.js";

const router = Router();

router.post("/", [verifyJWT], ReviewController.createReview);

router.get("/", [verifyJWT], ReviewController.getReviews);

router.get(
  "/:reviewId",
  [verifyJWT, validateObjectId],
  ReviewController.getReview,
);

router.patch(
  "/:reviewId",
  [verifyJWT, validateObjectId],
  ReviewController.updateReview,
);

router.delete(
  "/:reviewId",
  [verifyJWT, validateObjectId],
  ReviewController.deleteReview,
);

export default router;

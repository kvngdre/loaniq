import { Router } from "express";

import BankController from "../controllers/bank.controller.js";
import validateObjectId from "../middleware/validate-id.middleware.js";
import verifyJWT from "../middleware/verify-jwt.middleware.js";

const router = Router();

router.post("/", [verifyJWT], BankController.createBank);

router.get("/", BankController.getBanks);

router.get("/:bankId", [verifyJWT, validateObjectId], BankController.getBank);

router.patch(
  "/:bankId",
  [verifyJWT, validateObjectId],
  BankController.updateBank,
);

router.delete(
  "/:bankId",
  [verifyJWT, validateObjectId],
  BankController.deleteBank,
);

export default router;

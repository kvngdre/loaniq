import { Router } from "express";

import { AuthController } from "../controllers/index.js";
import { ValidateRequest } from "../middleware/index.js";
import { authValidators } from "../validators/index.js";

const router = Router();
const { registerSchema, verifySchema } = authValidators;

router.post(
  "/register",
  ValidateRequest.with(registerSchema),
  AuthController.register,
);

router.post(
  "/verify",
  ValidateRequest.with(verifySchema),
  AuthController.verify,
);

router.post("/login", AuthController.login);

router.post("/callback", AuthController.callback);

router.post("/logout", AuthController.logout);

router.post("/request-otp", AuthController.requestOTP);

router.get("/sessions/logout", AuthController.logOutAllSessions);

router.get("/tokens", AuthController.genTokens);

export default router;

import { Router } from "express";

import { authValidators } from "../../validators/index.js";
import { AuthController } from "../controllers/index.js";
import { ValidateRequest } from "../middleware/index.js";
import verifyJWT from "../middleware/verify-jwt.middleware.js";

const router = Router();
const { registerSchema } = authValidators;

router.post(
  "/register",
  ValidateRequest.with(registerSchema),
  AuthController.register,
);

router.post("/login", AuthController.login);

router.post("/callback", AuthController.callback);

router.get("/logout", AuthController.logout);

router.get("/sessions/logout", [verifyJWT], AuthController.signOutAllSessions);

router.get("/request-otp", AuthController.sendOTP);

router.get("/tokens", AuthController.getNewTokens);

export default router;

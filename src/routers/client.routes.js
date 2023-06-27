import { Router } from "express";
import verifyJWT from "../middleware/verify-jwt.middleware.js";
import ClientController from "../web/controllers/client.controller.js";

const router = Router();

router.post("/", verifyJWT, ClientController.createClient);

router.post("/signup", ClientController.signup);

router.post("/verify-signup", ClientController.verifySignup);

router.get("/", ClientController.getClients);

router.get("/:clientId", ClientController.getClient);

export default router;

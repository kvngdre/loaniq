import { Router } from "express";
import verifyJWT from "../middleware/verify-jwt.middleware.js";
import { getLoanData } from "../web/controllers/dashboardController.js";

const router = Router();

router.get("/charts", verifyJWT, async (req, res) => {
  const data = await getLoanData(req.user);
  // if (data instanceof ServerError)
  //   return res.status(data.errorCode).json(data.message);

  return res.status(200).json(data);
});

export default router;

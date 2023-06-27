import { Router } from "express";

import verifyJWT from "../middleware/verify-jwt.middleware.js";
import TransactionController from "../web/controllers/transaction.controller.js";

const router = Router();

router.post("/", [verifyJWT], TransactionController.createTxn);

router.get("/", [verifyJWT], TransactionController.getTxns);

router.get("/init", [verifyJWT], TransactionController.getPaymentLink);

router.get("/:txnId", [verifyJWT], TransactionController.getTxn);

router.patch("/:txnId", [verifyJWT], TransactionController.updateTxn);

router.delete("/:txnId", [verifyJWT], TransactionController.deleteTxn);

export default router;

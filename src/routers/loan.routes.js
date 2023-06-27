import { Router } from "express";
import verifyJWT from "../middleware/verify-jwt.middleware.js";
import LoanController from "../web/controllers/loan.controller.js";

const router = Router();

router.post("/", [verifyJWT], LoanController.createLoan);

router.get("/", [verifyJWT], LoanController.getLoans);

router.get("/:loanId", [verifyJWT], LoanController.getLoans);

router.patch("/:loanId", [verifyJWT], LoanController.updateLoan);

router.delete("/:loanId", [verifyJWT], LoanController.deleteLoan);

export default router;

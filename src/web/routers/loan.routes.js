import { Router } from "express";
import LoanController from "../controllers/loan.controller.js";
import verifyJWT from "../middleware/verify-jwt.middleware.js";

const router = Router();

router.post("/", [verifyJWT], LoanController.createLoan);

router.get("/", [verifyJWT], LoanController.getLoans);

router.get("/:loanId", [verifyJWT], LoanController.getLoans);

router.patch("/:loanId", [verifyJWT], LoanController.updateLoan);

router.delete("/:loanId", [verifyJWT], LoanController.deleteLoan);

export default router;

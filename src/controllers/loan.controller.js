import ValidationError from '../errors/validation.error.js';
import LoanService from '../services/loan.service.js';
import { HttpCode } from '../utils/HttpCode.js';
import loanValidator from '../validators/loan.validator.js';
import BaseController from './base.controller.js';

class LoanController extends BaseController {
  static createLoan = async (req, res) => {
    const { value, error } = loanValidator.validateCreate(req.body);
    if (error) throw new ValidationError(null, error);

    const newLoan = await LoanService.createLoan(value, req.currentUser);
    const response = this.apiResponse('Loan created.', newLoan);

    res.status(HttpCodes.CREATED).json(response);
  };

  static getLoans = async (req, res) => {
    const [count, loans] = LoanService.getLoans(req.currentUser.tenantId);

    const message = this.getMsgFromCount(count);
    const response = this.apiResponse(message, loans);

    res.status(HttpCodes.OK).json(response);
  };

  static getLoan = async (req, res) => {
    const loan = await LoanService.getLoan(req.currentUser.tenantId);
    const response = this.apiResponse('Fetched loan.', loan);

    res.status(HttpCodes.OK).json(response);
  };

  static updateLoan = async (req, res) => {
    const { value, error } = loanValidator.validateUpdate(req.body);
    if (error) throw new ValidationError(null, error);

    const loan = await LoanService.updateLoan(req.params.loanId, value);
    const response = this.apiResponse('Loan updated.', loan);

    res.status(HttpCodes.OK).json(response);
  };

  static deleteLoan = async (req, res) => {
    await LoanService.deleteLoan(req.params.loanId);
    const response = this.apiResponse('Loan deleted.');

    res.status(HttpCodes.OK).json(response);
  };
}

export default LoanController;

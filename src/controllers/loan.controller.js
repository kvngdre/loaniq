import { httpCodes } from '../utils/common.js';
import BaseController from './base.controller.js';
import LoanService from '../services/loan.service.js';
import loanValidator from '../validators/loan.validator.js';
import ValidationError from '../errors/ValidationError.js';

class LoanController extends BaseController {
  static createLoan = async (req, res) => {
    const { value, error } = loanValidator.validateCreate(req.body);
    if (error) throw new ValidationError(null, error);

    const newLoan = await LoanService.createLoan(value, req.currentUser);
    const response = this.apiResponse('Loan created.', newLoan);

    res.status(httpCodes.CREATED).json(response);
  };

  static getLoans = async (req, res) => {
    const [count, loans] = LoanService.getLoans(req.currentUser.tenantId);

    const message = this.getMsgFromCount(count);
    const response = this.apiResponse(message, loans);

    res.status(httpCodes.OK).json(response);
  };

  static getLoan = async (req, res) => {
    const loan = await LoanService.getLoan(req.currentUser.tenantId);
    const response = this.apiResponse('Fetched loan.', loan);

    res.status(httpCodes.OK).json(response);
  };

  static updateLoan = async (req, res) => {
    const { value, error } = loanValidator.validateUpdate(req.body);
    if (error) throw new ValidationError(null, error);

    const loan = await LoanService.updateLoan(req.params.loanId, value);
    const response = this.apiResponse('Loan updated.', loan);

    res.status(httpCodes.OK).json(response);
  };

  static deleteLoan = async (req, res) => {
    await LoanService.deleteLoan(req.params.loanId);
    const response = this.apiResponse('Loan deleted.');

    res.status(httpCodes.OK).json(response);
  };
}

export default LoanController;

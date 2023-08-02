import ValidationError from "../errors/ValidationError.js";
import BankService from "../services/bank.service.js";
import { HttpCode } from "../utils/common.js";
import bankValidator from "../validators/bank.validator.js";
import BaseController from "./base.controller.js";

class BankController extends BaseController {
  static createBank = async (req, res) => {
    const { value, error } = bankValidator.validateCreate(req.body);
    if (error) throw new ValidationError(null, error);

    const newBank = await BankService.create(value);
    const response = this.apiResponse("Bank created.", newBank);

    res.status(HttpCode.CREATED).json(response);
  };

  static getBanks = async (req, res) => {
    const [count, banks] = await BankService.getBanks();
    const message = this.getMsgFromCount(count);

    const response = this.apiResponse(message, banks);
    res.status(HttpCode.OK).json(response);
  };

  static getBank = async (req, res) => {
    const bank = await BankService.getBank(req.params.bankId);
    const response = this.apiResponse("Fetched bank.", bank);

    res.status(HttpCode.OK).json(response);
  };

  static updateBank = async (req, res) => {
    const { value, error } = bankValidator.validateUpdate(req.body);
    if (error) throw new ValidationError(null, error);

    const bank = await BankService.updateBank(req.params.bankId, value);
    const response = this.apiResponse("Bank updated", bank);

    res.status(HttpCode.OK).json(response);
  };

  static deleteBank = async (req, res) => {
    await BankService.deleteBank(req.params.bankId);
    const response = this.apiResponse("Bank deleted.");

    res.status(HttpCode.OK).json(response);
  };
}

export default BankController;

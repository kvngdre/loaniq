import ValidationError from '../errors/validation.error.js';
import paystackService from '../services/paystack.service.js';
import txnService from '../services/transaction.service.js';
import { HttpCodes } from '../utils/HttpCodes.js';
import txnValidator from '../validators/transactionValidator.js';
import BaseController from './base.controller.js';

class TransactionController extends BaseController {
  static createTxn = async (req, res) => {
    const { value, error } = txnValidator.validateCreate(req.body);
    if (error) throw new ValidationError(null, error);

    const newTransaction = await txnService.createTxn(value);
    const response = this.apiResponse('Transaction created.', newTransaction);

    res.status(HttpCodes.CREATED).json(response);
  };

  static getTxns = async (req, res) => {
    const [count, transactions] = await txnService.getTxns(
      req.currentUser.tenantId,
    );
    const message = this.getMsgFromCount(count);
    const response = this.apiResponse(message, transactions);

    res.status(HttpCodes.OK).json(response);
  };

  static getTxn = async (req, res) => {
    const transaction = await txnService.getTxn(req.params.txnId);
    const response = this.apiResponse('Fetched transaction', transaction);

    res.status(HttpCodes.OK).json(response);
  };

  static updateTxn = async (req, res) => {
    const { txnId } = req.params;
    const { value, error } = txnValidator.validateUpdate(req.body);
    if (error) throw new ValidationError(null, error);

    const transaction = await txnService.updateTxn({ _id: txnId }, value);
    const response = this.apiResponse('Transaction updated.', transaction);

    res.status(HttpCodes.OK).json(response);
  };

  static deleteTxn = async (req, res) => {
    await txnService.deleteTxn(req.params.txnId);
    const response = this.apiResponse('Transaction deleted.');

    res.status(HttpCodes.OK).json(response);
  };

  static getPaymentLink = async (req, res) => {
    const { value, error } = txnValidator.validateInitTxn(req.query);
    if (error) throw new ValidationError(null, error);
    console.log(typeof value.amount);

    const data = await paystackService.initTransaction(
      req.currentUser.tenantId,
      value.amount,
    );
    const response = this.apiResponse('Transaction initialized.', data);

    res.status(HttpCodes.OK).json(response);
  };
}

export default TransactionController;

import Joi from 'joi';
import BaseValidator from './base.validator.js';
import { txnStatus, txnTypes, txnPurposes } from '../utils/common.js';

class TransactionValidator extends BaseValidator {
  #refSchema;

  #statusSchema;

  #txnTypeSchema;

  #txnPurposeSchema;

  constructor() {
    super();

    this.#refSchema = Joi.string().alphanum().trim().label('Reference');
    this.#statusSchema = Joi.string()
      .valid(...Object.values(txnStatus))
      .label('Status')
      .trim();
    this.#txnTypeSchema = Joi.string()
      .valid(...Object.values(txnTypes))
      .label('Type')
      .trim();
    this.#txnPurposeSchema = Joi.string()
      .valid(...Object.values(txnPurposes))
      .label('Purpose')
      .trim();
  }

  validateCreate = (dto) => {
    const schema = Joi.object({
      tenantId: this._objectIdSchema.label('Tenant id').required(),
      reference: this.#refSchema.required(),
      status: this.#statusSchema.required(),
      type: this.#txnTypeSchema.required(),
      purpose: this.#txnPurposeSchema.required(),
      description: this._descSchema.required(),
      amount: this._amountSchema.label('Amount').required(),
      currency: Joi.string().trim(),
      fees: this._amountSchema.label('Fees'),
      balance: this._amountSchema.label('Balance').required(),
    });

    let { value, error } = schema.validate(dto, {
      abortEarly: false,
      convert: false,
    });
    error = this._refineError(error);

    return { value, error };
  };

  validateUpdate = (dto) => {
    const schema = Joi.object({
      tenantId: this._objectIdSchema.label('Tenant id'),
      reference: this.#refSchema,
      status: this.#statusSchema,
      type: this.#txnTypeSchema,
      purpose: this.#txnPurposeSchema,
      description: this._descSchema,
      amount: this._amountSchema.label('Amount'),
      currency: Joi.string().trim(),
      fees: this._amountSchema.label('Fees'),
      balance_before: this._amountSchema.label('Balance before'),
      balance_after: this._amountSchema.label('Balance after'),
    });

    let { value, error } = schema.validate(dto, {
      abortEarly: false,
      convert: false,
    });
    error = this._refineError(error);

    return { value, error };
  };

  validateInitTxn = (dto) => {
    const schema = Joi.object({
      amount: this._amountSchema.label('Amount').required(),
    });

    let { value, error } = schema.validate(dto, { abortEarly: false });
    error = this._refineError(error);

    return { value, error };
  };
}

export default new TransactionValidator();

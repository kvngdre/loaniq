import { randomBytes } from 'crypto'
import BaseValidator from './base.validator'
import Joi from 'joi'
import { txnPurposes, txnStatus, txnTypes } from '../utils/common'

class WalletValidator extends BaseValidator {
  #referenceSchema

  constructor () {
    super()

    this.#referenceSchema = Joi.string().default(randomBytes(4).toString('hex'))
  }

  validateCreate = (dto, tenantId) => {
    const schema = Joi.object({
      tenantId: this._objectIdSchema.label('Tenant id').default(tenantId).forbidden(),
      balance: this._amountSchema.label('Balance').default(0),
      last_credit_date: this._dateSchema.label('Last credit date')
    })

    let { value, error } = schema.validate(dto, {
      abortEarly: false,
      convert: false
    })
    error = this._refineError(error)

    return { value, error }
  }

  validateUpdate = (dto) => {
    const schema = Joi.object({
      balance: this._amountSchema.label('Balance'),
      last_credit_date: this._dateSchema.label('Last credit date')
    })

    let { value, error } = schema.validate(dto, {
      abortEarly: false,
      convert: false
    })
    error = this._refineError(error)

    return { value, error }
  }

  validateCredit = (tenantId, dto) => {
    const schema = Joi.object({
      tenantId: this._objectIdSchema.default(tenantId),
      reference: this.#referenceSchema,
      status: Joi.string().default(txnStatus.SUCCESS),
      type: Joi.string().default(txnTypes.CREDIT),
      purpose: Joi.string().trim().default(txnPurposes.DEPOSIT),
      description: this._descSchema.required(),
      amount: this._amountSchema.required()
    })

    let { value, error } = schema.validate(dto, {
      abortEarly: false,
      convert: false
    })
    error = this._refineError(error)

    return { value, error }
  }

  validateDebit = (tenantId, dto) => {
    const schema = Joi.object({
      tenantId: this._objectIdSchema.default(tenantId),
      reference: this.#referenceSchema,
      status: Joi.string().default(txnStatus.SUCCESS),
      type: Joi.string().default(txnTypes.DEBIT),
      purpose: Joi.string().trim().default(txnPurposes.WITHDRAW),
      description: this._descSchema.required(),
      amount: this._amountSchema.required()
    })

    let { value, error } = schema.validate(dto, {
      abortEarly: false,
      convert: false
    })
    error = this._refineError(error)

    return { value, error }
  }
}

export default new WalletValidator()

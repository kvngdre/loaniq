import BaseValidator from './base.validator.js'
import Joi from 'joi'

class LoanValidator extends BaseValidator {
  #amountInWordsSchema

  constructor() {
    super()

    this.#amountInWordsSchema = Joi.string().trim().max(255).label('Amount in words')
  }

  validateCreate = (dto, currentUser) => {
    const schema = Joi.object({
      tenantId: this._objectIdSchema.label('Tenant id').default(currentUser.tenantId),
      customer: this._objectIdSchema.label('Customer').required(),
      amount: this._amountSchema.label('amount').required(),
      amount_in_words: this.#amountInWordsSchema.required(),
      tenor: this._tenorSchema.label('Tenor').required(),
      analyst: this._objectIdSchema.label('Analyst'),
      agent: this._objectIdSchema.label('Agent')
    })

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }

  validateUpdate = (dto, currentUser) => {
    const schema = Joi.object({
      customer: this._objectIdSchema.label('Customer'),
      amount: this._amountSchema.label('amount'),
      proposed_amount: this._amountSchema.label('Proposed amount'),
      amount_in_words: this.#amountInWordsSchema,
      tenor: this._tenorSchema.label('Tenor'),
      proposed_tenor: this._tenorSchema.label('Proposed tenor'),
      analyst: this._objectIdSchema.label('Analyst'),
      agent: this._objectIdSchema.label('Agent'),
      params: Joi.object({
        interest_rate: this._percentageSchema,
        fees: this._feesSchema,
        max_dti: this._percentageSchema.label('Maximum DTI'),
        min_income: this._amountSchema.label('Minimum income'),
        income: this._amountSchema.label('Income'),
        age: this._ageSchema,
        tenure: this._tenureSchema
      }).min(1),
      date_approved_or_denied: this._dateSchema.label('Date approved or denied'),
      date_liquidated: this._dateSchema.label('Date liquidated'),
      maturity_date: this._dateSchema.label('Maturity date'),
      isBooked: Joi.boolean(),
      isDisbursed: Joi.boolean(),
      isLocked: Joi.boolean()
    })

    let { value, error } = schema.validate(dto, { abortEarly: false })
    error = this._refineError(error)

    return { value, error }
  }
}

export default new LoanValidator()

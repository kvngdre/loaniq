import BaseValidator from './base.validator'
import Joi from 'joi'

class WalletValidator extends BaseValidator {
  validateCreate = (dto) => {
    const schema = Joi.object({
      tenantId: this._objectIdSchema.label('Tenant id').required(),
      balance: this._amountSchema.label('Balance').default(0),
      last_credit_date: this._dateSchema.label('Last credit date')
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }

  validateUpdate = (dto) => {
    const schema = Joi.object({
      balance: this._amountSchema.label('Balance'),
      last_credit_date: this._dateSchema.label('Last credit date')
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }
}

export default new WalletValidator()

import Joi from 'joi'
import BaseValidator from './base.validator'

class SegmentConfigValidator extends BaseValidator {
  validateCreate = (tenantId, dto) => {
    const schema = Joi.object({
      tenantId: this._objectIdSchema.label('Tenant Id').default(tenantId),
      segment: this._objectIdSchema.required(),
      active: this._activeSchema.default(false),
      min_loan_amount: this._amountSchema
        .label('Minimum loan amount')
        .required(),
      max_loan_amount: this._amountSchema
        .label('Maximum loan amount')
        .required(),
      min_tenor: this._tenorSchema.label('Minimum loan tenor').required(),
      max_tenor: this._tenorSchema.label('Maximum loan tenor').required(),
      interest_rate: this._percentageSchema.required(),
      mgt_fee_percent: this._percentageSchema
        .label('Management fee')
        .required(),
      transfer_fee: this._amountSchema.label('Transfer fee').required(),
      min_net_pay: this._amountSchema.label('Minimum net pay').required(),
      max_net_pay: this._amountSchema
        .label('Maximum net pay')
        .min(Joi.ref('min_net_pay'))
        .default(Joi.ref('min_net_pay')),
      max_dti: this._percentageSchema.label('Maximum D.T.I').required()
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }

  validateUpdate = (dto) => {
    const schema = Joi.object({
      // tenantId: this._objectIdSchema.label('Tenant Id').default(tenantId),
      segment: this._objectIdSchema.required(),
      active: this._activeSchema,
      min_loan_amount: this._amountSchema.label('Minimum loan amount'),
      max_loan_amount: this._amountSchema.label('Maximum loan amount'),
      min_tenor: this._tenorSchema.label('Minimum loan tenor'),
      max_tenor: this._tenorSchema.label('Maximum loan tenor'),
      interest_rate: this._percentageSchema,
      mgt_fee_percent: this._percentageSchema.label('Management fee'),
      transfer_fee: this._amountSchema.label('Transfer fee'),
      min_net_pay: this._amountSchema.label('Minimum net pay'),
      max_net_pay: this._amountSchema
        .label('Maximum net pay')
        .min(Joi.ref('min_net_pay'))
        .default(Joi.ref('min_net_pay')),
      max_dti: this._percentageSchema.label('Maximum D.T.I')
    }).min(1)

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }
}

export default new SegmentConfigValidator()

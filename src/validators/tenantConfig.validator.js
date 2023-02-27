import Joi from 'joi'
import BaseValidator from './base.validator'

class TenantConfigValidator extends BaseValidator {
  validateCreate = (dto) => {
    const schema = Joi.object({
      tenantId: this._objectIdSchema.label('Tenant id').required(),
      default_params: Joi.object().keys({
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
      }).label('Default parameters')
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }

  validateUpdate = (dto) => {
    const schema = Joi.object({
      default_params: Joi.object()
        .keys({
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
        })
        .min(1).label('Default parameters')
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }
}

export default new TenantConfigValidator()

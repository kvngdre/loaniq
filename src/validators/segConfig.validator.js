import Joi from 'joi'
import BaseValidator from './base.validator.js'

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
      fees: this._feesSchema,
      min_income: this._amountSchema.label('Minimum income').required(),
      max_income: this._amountSchema
        .label('Maximum income')
        .min(Joi.ref('min_income'))
        .default(Joi.ref('min_income')),
      max_dti: this._percentageSchema.label('Maximum D.T.I').required()
    })

    let { value, error } = schema.validate(dto, { abortEarly: false, convert: false })
    error = this._refineError(error)

    return { value, error }
  }

  validateUpdate = (dto) => {
    const schema = Joi.object({
      segment: this._objectIdSchema.required(),
      active: this._activeSchema,
      max_age: this._ageSchema.label('Maximum age').required(),
      max_tenure: this._tenureSchema().label('Maximum tenure').required(),
      min_loan_amount: this._amountSchema.label('Minimum loan amount'),
      max_loan_amount: this._amountSchema.label('Maximum loan amount'),
      min_tenor: this._tenorSchema.label('Minimum loan tenor'),
      max_tenor: this._tenorSchema.label('Maximum loan tenor'),
      interest_rate: this._percentageSchema,
      fees: this._feesSchema,
      min_income: this._amountSchema.label('Minimum income'),
      max_income: this._amountSchema
        .label('Maximum income')
        .min(Joi.ref('min_income'))
        .default(Joi.ref('min_income')),
      max_dti: this._percentageSchema.label('Maximum D.T.I')
    }).min(1)

    let { value, error } = schema.validate(dto, { abortEarly: false, convert: false })
    error = this._refineError(error)

    return { value, error }
  }
}

export default new SegmentConfigValidator()

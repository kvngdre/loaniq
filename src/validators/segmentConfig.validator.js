import Joi from 'joi'
import SegmentConfigDAO from '../daos/segmentConfig.dao'
import BaseValidator from './base.validator'

class SegmentConfigValidator extends BaseValidator {
  constructor() {
    super()

    this.validatePayRange = async (tenantId, segmentId, min, max) => {
      const current = [min, max]

      const foundDocs = await SegmentConfigDAO.findDocsByField(
        { tenantId, segment: segmentId },
        {},
        { min_net_pay: -1 }
      )

      const netRanges = getMinMax(foundDocs)
      function getMinMax (docs) {
        const result = [current]
        for (const doc of docs) {
          result.push([doc._doc.min_net_pay, doc._doc.max_net_pay])
        }
        result.sort((a, b) => a[0] - b[0])

        return result
      }

      // Find gaps in range
      const foundGaps = findGaps(netRanges)
      function findGaps (ranges) {
        const len = ranges.length
        let end = ranges[0][1]
        let rem = 0

        for (let i = 1; i < len; i++) {
          if (ranges[i][0] < end) {
            rem += 1

            return rem
          }else{
            end = ranges[i][1]
          }
      }

      return rem
    }
  }

  validateCreate = (dto, tenantId) => {
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
      max_net_pay: this._amountSchema.label('Maximum net pay').min(Joi.ref('min_net_pay')).default(Joi.ref('min_net_pay')),
      max_dti: this._percentageSchema.label('Maximum D.T.I').required()
    })

    let { value, error } = schema.validate(dto)
    error = this._refineError(error)

    return { value, error }
  }
}

export default new SegmentConfigValidator()

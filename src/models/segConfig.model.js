import { Schema, model } from 'mongoose'
import NotFoundError from '../errors/NotFoundError'

const schemaOptions = { timestamps: true, versionKey: false }

const segConfigSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      // unique: true,
      required: [true, 'Tenant Id is required.']
    },

    segment: {
      type: Schema.Types.ObjectId,
      ref: 'Segment',
      required: [true, 'Segment Id is required.']
    },

    active: {
      type: Boolean,
      default: false
    },

    min_loan_amount: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, 'Minimum loan amount is required.']
    },

    max_loan_amount: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, 'Maximum loan amount is required.']
    },

    min_tenor: {
      type: Number,
      required: [true, 'Minimum tenor is required.']
    },

    max_tenor: {
      type: Number,
      required: [true, 'Maximum tenor is required.']
    },

    interest_rate: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, 'Interest rate is required.']
    },

    mgt_fee_percent: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, 'Management fee is required.']
    },

    transfer_fee: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, 'Transfer fee is required.']
    },

    min_net_pay: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, 'Minimum net pay is required.']
    },

    max_net_pay: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      default: null
    },

    max_dti: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, 'Maximum DTI ratio is required.']
    }
  },
  schemaOptions
)

segConfigSchema.index(
  { tenantId: 1, segment: 1, min_net_pay: 1 },
  { unique: true }
)
// segConfigSchema.index({ min_net_pay: 1, tenantId: 1 }, { unique: true })

segConfigSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('Segment configurations not found.')
  }

  if (!doc) throw new NotFoundError('Segment configuration not found.')
})

const SegmentConfig = model('SegmentConfig', segConfigSchema)

export default SegmentConfig

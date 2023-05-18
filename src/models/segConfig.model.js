import { feeTypes } from '../utils/common.js';
import { Schema, model } from 'mongoose';
import NotFoundError from '../errors/NotFoundError.js';

const schemaOptions = { timestamps: true, versionKey: false };

const segConfigSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant Id is required.'],
    },

    segment: {
      type: Schema.Types.ObjectId,
      ref: 'Segment',
      required: [true, 'Segment Id is required.'],
    },

    active: {
      type: Boolean,
      default: false,
    },

    max_age: {
      type: Number,
      required: true,
    },

    max_tenure: {
      type: Number,
      required: true,
    },

    min_loan_amount: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, 'Minimum loan amount is required.'],
    },

    max_loan_amount: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, 'Maximum loan amount is required.'],
    },

    min_tenor: {
      type: Number,
      required: [true, 'Minimum tenor is required.'],
    },

    max_tenor: {
      type: Number,
      required: [true, 'Maximum tenor is required.'],
    },

    interest_rate: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, 'Interest rate is required.'],
    },

    fees: [
      {
        name: {
          type: String,
          required: true,
        },

        type: {
          type: String,
          enum: Object.values(feeTypes),
          required: true,
        },

        value: {
          type: Number,
          set: (v) => Math.floor(v * 100) / 100,
          required: true,
        },
      },
    ],

    min_income: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, 'Minimum income is required.'],
    },

    max_income: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, 'Maximum income is required.'],
    },

    max_dti: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, 'Maximum DTI ratio is required.'],
    },
  },
  schemaOptions,
);

segConfigSchema.index({ tenantId: 1, segment: 1, min_net_pay: 1 }, { unique: true });
// segConfigSchema.index({ min_net_pay: 1, tenantId: 1 }, { unique: true })

segConfigSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('Segment configurations not found.');
  }

  if (!doc) throw new NotFoundError('Segment configuration not found.');
});

const SegmentConfig = model('Segment_Config', segConfigSchema);

export default SegmentConfig;

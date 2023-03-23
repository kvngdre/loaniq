import { feeTypes } from '../utils/constants'
import { Schema, model } from 'mongoose'
import NotFoundError from '../errors/NotFoundError'

const schemaOptions = { timestamps: true, versionKey: false }

const tenantConfigSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      unique: true,
      required: [true, 'Tenant Id is required.']
    },

    resetPwdFrequency: {
      // In  number of days
      type: Number,
      default: null
    },

    allowUserPwdReset: {
      type: Boolean,
      default: false
    },

    default_params: {
      min_loan_amount: {
        type: Number,
        default: null
      },

      max_loan_amount: {
        type: Number,
        default: null
      },

      min_tenor: {
        // In  months
        type: Number,
        default: null
      },

      max_tenor: {
        // In months
        type: Number,
        default: null
      },

      interest_rate: {
        type: Number,
        default: null
      },

      max_dti: {
        type: Number,
        default: null
      }
    },

    fees: [
      {
        name: {
          type: String,
          required: true
        },

        type: {
          type: String,
          enum: Object.values(feeTypes),
          required: true
        },

        value: {
          type: Number,
          set: (v) => Math.floor(v * 100) / 100,
          required: true
        }
      }
    ],

    socials: [
      {
        platform: { type: String, trim: true },
        url: { type: String, trim: true }
      }
    ],

    formId: {
      type: String,
      unique: true,
      sparse: true
    },

    form_theme: {
      background_color: { type: String }
    },

    reset_period: {
      type: Number
    }
  },
  schemaOptions
)

tenantConfigSchema.post(/^find/, function (docs) {
  if (Array.isArray(docs) && docs.length === 0) {
    throw new NotFoundError('Tenants configurations not found.')
  }

  if (!docs) throw new NotFoundError('Tenant configurations not found.')
})

const TenantConfig = model('TenantConfig', tenantConfigSchema)

export default TenantConfig

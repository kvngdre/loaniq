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
        type: Number,
        default: null
      },

      max_tenor: {
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

    support: {
      email: {
        type: String,
        trim: true,
        default: null
      },

      phone_number: {
        type: String,
        default: null
      }
    },

    reset_period: {
      type: Number
    }
  },
  schemaOptions
)

tenantConfigSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('Tenant configurations not found.')
  }

  if (!doc) throw new NotFoundError('Tenant configuration not found.')
})

const TenantConfig = model('TenantConfig', tenantConfigSchema)

export default TenantConfig

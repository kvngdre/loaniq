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

      mgt_fee_percent: {
        type: Number,
        default: null
      },

      transfer_fee: {
        type: Number,
        default: null
      },

      min_net_pay: {
        type: Number,
        default: null
      },

      max_net_pay: {
        type: Number,
        default: null
      },

      max_dti: {
        type: Number,
        default: null
      }
    },

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

    form_data: {
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

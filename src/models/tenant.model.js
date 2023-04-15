import { companyCategory, status } from '../utils/common.js'
import { Schema, model } from 'mongoose'
import NotFoundError from '../errors/NotFoundError.js'

const schemaOptions = { timestamps: true, versionKey: false }

const tenantSchema = new Schema(
  {
    logo: {
      type: String,
      default: null
    },

    company_name: {
      type: String,
      unique: true,
      sparse: true
      // required: true
    },

    address: {
      type: String,
      maxLength: 255,
      default: null
    },

    state: {
      type: Schema.Types.ObjectId,
      ref: 'State'
    },

    cac_number: {
      type: String,
      unique: true,
      sparse: true,
      default: null
    },

    category: {
      type: String,
      enum: companyCategory
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      default: null
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: Object.values(status),
      default: status.onboarding
    },

    activated: {
      type: Boolean,
      default: false
    },

    owner_id_type: {
      type: String,
      default: null
      // enum: validIds
    },

    owner_id_number: {
      type: String,
      default: null
    },

    licenses: {
      type: [
        {
          name: { type: String, required: true },
          url: { type: String, required: true },
          expires: { type: Date, default: null }
        }
      ],
      default: null
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

tenantSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('Tenants not found.')
  }

  if (!doc) throw new NotFoundError('Tenant not found.')
})

const Tenant = model('Tenant', tenantSchema)

export default Tenant

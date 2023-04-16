import { companyCategory, status, validIds } from '../utils/common.js'
import { Schema, model } from 'mongoose'
import NotFoundError from '../errors/NotFoundError.js'

const schemaOptions = { timestamps: true, versionKey: false }

const tenantSchema = new Schema(
  {
    logo: {
      type: String,
      default: null
    },

    business_name: {
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
      default: status.ONBOARDING
    },

    activated: {
      type: Boolean,
      default: false
    },

    documentation: {
      type: [
        {
          name: { type: String, required: true },
          type: { type: String, enum: validIds },
          url: { type: String, required: true },
          expires: { type: Date, default: null }
        }
      ],
      default: null
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

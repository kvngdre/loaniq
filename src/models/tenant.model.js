import { companyCategory } from '../utils/common.js'
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
      lowercase: true,
      unique: true,
      trim: true,
      required: true
    },

    address: {
      type: String,
      trim: true
    },

    state: {
      type: Schema.Types.ObjectId,
      ref: 'State'
    },

    cac_number: {
      type: String,
      unique: true,
      sparse: true
    },

    category: {
      type: String,
      enum: companyCategory
    },

    phone_number: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    active: {
      type: Boolean,
      default: true
    },

    activated: {
      type: Boolean,
      default: false
    },

    id_type: {
      type: String
      // enum: validIds
    },

    id_number: {
      type: String
    },

    licenses: {
      type: [{
        name: String,
        url: String,
        expires: Date
      }]
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

tenantSchema.post(/^find/, function(doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('Tenants not found.')
  }

  if (!doc) throw new NotFoundError('Tenant not found.')
})

const Tenant = model('Tenant', tenantSchema)

export default Tenant

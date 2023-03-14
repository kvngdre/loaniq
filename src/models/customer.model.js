import { computeAge, computeTenure } from '../helpers'
import {
  maritalStatus,
  relationships,
  validIds
} from '../utils/constants'
import { Schema, model } from 'mongoose'
import NotFoundError from '../errors/NotFoundError'

const schemaOptions = { timestamps: true, versionKey: false }

const customerSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true
    },

    passport: {
      type: String,
      default: null
    },

    id_card: {
      type: String,
      default: null
    },

    first_name: {
      type: String,
      minLength: 3,
      maxLength: 50,
      trim: true,
      required: true
    },

    last_name: {
      type: String,
      minLength: 3,
      maxLength: 50,
      trim: true,
      required: true
    },

    middle_name: {
      type: String,
      minLength: 3,
      maxLength: 50,
      trim: true
    },

    gender: {
      type: String,
      enum: ['Male', 'Female'],
      required: true
    },

    birth_date: {
      type: Date,
      required: true
    },

    address: {
      type: String,
      trim: true,
      maxLength: 255,
      lowercase: true,
      required: true
    },

    state: {
      type: Schema.Types.ObjectId,
      ref: 'State',
      required: true
    },

    phone_number: {
      type: String,
      trim: true,
      required: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null
    },

    marital_status: {
      type: String,
      enum: maritalStatus,
      required: true
    },

    bvn: {
      type: String,
      trim: true,
      required: true
    },

    staff_id: {
      type: String,
      uppercase: true,
      trim: true,
      required: true
    },

    id_type: {
      type: String,
      enum: validIds,
      required: true
    },

    id_number: {
      type: String,
      minLength: 4,
      maxLength: 50,
      trim: true,
      required: true
    },

    segment: {
      type: Schema.Types.ObjectId,
      ref: 'Segment',
      required: true
    },

    command: {
      type: String,
      trim: true,
      default: null
    },

    employer_address: {
      type: String,
      trim: true,
      maxLength: 255,
      lowercase: true,
      required: true
    },

    employer_state: {
      type: String,
      required: true
    },

    hire_date: {
      type: Date,
      required: true
    },

    income: {
      type: Number,
      required: true
    },

    nok_full_name: {
      type: String,
      trim: true,
      required: true
    },

    nok_address: {
      type: String,
      trim: true,
      maxLength: 255,
      lowercase: true,
      required: true
    },

    nok_state: {
      type: Schema.Types.ObjectId,
      ref: 'State',
      required: true
    },

    nok_phone_number: {
      type: String,
      trim: true,
      required: true
    },

    nok_relationship: {
      type: String,
      enum: relationships,
      required: true
    },

    account_name: {
      type: String,
      lowercase: true,
      required: true,
      trim: true
    },

    account_number: {
      type: String,
      trim: true,
      required: true
    },

    bank: {
      type: Schema.Types.ObjectId,
      ref: 'Bank',
      required: true
    },

    agent: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  schemaOptions
)

// ! Creating compound indexes
customerSchema.index({ staff_id: 1, tenantId: 1 }, { unique: true })
customerSchema.index({ bvn: 1, tenantId: 1 }, { unique: true })
customerSchema.index({ account_number: 1, tenantId: 1 }, { unique: true })

customerSchema.virtual('full_name').get(function () {
  return this.first_name.concat(
    this.middle_name ? ` ${this.middle_name}` : '',
    ` ${this.last_name}`
  )
})

customerSchema.virtual('age').get(function () {
  return computeAge(this.birth_date)
})

customerSchema.virtual('tenure').get(function () {
  return computeTenure(this.hire_date)
})

customerSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('Customers not found.')
  }

  if (!doc) throw new NotFoundError('Customer not found.')
})

const Customer = model('Customer', customerSchema)

export default Customer

import { maritalStatus, relationships, validIds } from '../utils/common.js'
import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'
import computeAge from '../utils/computeAge.js'
import computeTenure from '../utils/computeTenure.js'
import NotFoundError from '../errors/NotFoundError.js'

const schemaOptions = {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true }
}
const { hashSync, compareSync } = bcrypt

const originSchema = new Schema(
  {
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

    status: {
      type: String,
      default: 'Retired'
    },

    active: {
      type: Boolean,
      default: false
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
      unique: true,
      sparse: true,
      required: true
    },

    isPhoneVerified: {
      type: Boolean,
      default: false
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
      unique: true,
      sparse: true,
      required: true
    },

    isValidBVN: {
      type: Boolean,
      default: false
    },

    staff_id: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      required: true
    },

    password: {
      type: String,
      trim: true,
      maxLength: 1024,
      required: true
    },

    resetPwd: {
      type: Boolean,
      default: true
    },

    otp: {
      pin: {
        type: String,
        default: null
      },

      expiresIn: {
        type: Number,
        default: null
      }
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
      type: Map,
      of: [Number]
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
      unique: true,
      sparse: true,
      required: true
    },

    bank: {
      type: Schema.Types.ObjectId,
      ref: 'Bank',
      required: true
    },

    isValidAccInfo: {
      type: Boolean,
      default: false
    },

    session: {
      os: String,
      location: String,
      client: String,
      ip: String,
      login_time: Date,
      token: String,
      expiresIn: Number
    }
  },
  schemaOptions
)

originSchema.virtual('full_name').get(function() {
  return this.first_name.concat(
    this.middle_name ? ` ${this.middle_name}` : '',
    ` ${this.last_name}`
  )
})

originSchema.virtual('age').get(function() {
  return computeAge(this.birth_date)
})

originSchema.virtual('tenure').get(function() {
  return computeTenure(this.hire_date)
})

originSchema.methods.getMonthNetPay = function(year, month) {
  return this.income[year][month]
}

originSchema.methods.validatePassword = function(password) {
  return compareSync(password, this.password)
}

originSchema.pre('save', function(next) {
  if (this.modifiedPaths()?.includes('password')) {
    this.password = hashSync(this.password, 10)
  }

  next()
})

originSchema.post(/^find/, function(doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('Accounts not found.')
  }

  if (!doc) throw new NotFoundError('Account not found.')
})

const Origin = model('Origin', originSchema)

export default Origin

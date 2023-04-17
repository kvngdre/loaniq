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

const clientSchema = new Schema(
  {
    passport: {
      type: String,
      // required: true,
      default: null
    },

    id_card: {
      type: String,
      // required: true,
      default: null
    },

    first_name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
      trim: true
    },

    last_name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
      trim: true
    },

    middle_name: {
      type: String,
      minLength: 3,
      maxLength: 50,
      trim: true
    },

    status: {
      type: String,
      default: 'retired'
    },

    active: {
      type: Boolean,
      default: false
    },

    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      default: '643d935b91a080bc035b5bf8',
      autopopulate: true
    },

    gender: {
      type: String,
      // required: true,
      enum: ['male', 'female']
    },

    birth_date: {
      type: Date,
      // required: true,
      default: null
    },

    address: {
      type: String,
      // required: true,
      trim: true,
      maxLength: 255,
      lowercase: true
    },

    state: {
      type: Schema.Types.ObjectId,
      // required: true,
      ref: 'State'
    },

    phone_number: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    isPhoneVerified: {
      type: Boolean,
      default: false
    },

    email: {
      type: String,
      default: null
    },

    marital_status: {
      type: String,
      // required: true,
      enum: maritalStatus
    },

    bvn: {
      type: String,
      // required: true,
      trim: true,
      unique: true,
      sparse: true
    },

    isValidBVN: {
      type: Boolean,
      default: false
    },

    staff_id: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true
    },

    password: {
      type: String,
      // required: true,
      trim: true,
      maxLength: 1024
    },

    resetPwd: {
      type: Boolean,
      default: false
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
      // required: true,
      enum: validIds
    },

    id_number: {
      type: String,
      // required: true,
      minLength: 4,
      maxLength: 50,
      trim: true
    },

    segment: {
      type: Schema.Types.ObjectId,
      // required: true,
      ref: 'Segment'
    },

    command: {
      type: String,
      // required: true,
      trim: true,
      default: null
    },

    employer_address: {
      type: String,
      // required: true,
      trim: true,
      maxLength: 255,
      lowercase: true
    },

    employer_state: {
      type: Schema.Types.ObjectId,
      // required: true,
      ref: 'State'
    },

    hire_date: {
      type: Date,
      // required: true,
      default: null
    },

    income: {
      type: Map,
      of: Schema.Types.Mixed
    },

    nok_full_name: {
      type: String,
      // required: true,
      trim: true
    },

    nok_address: {
      type: String,
      trim: true,
      maxLength: 255,
      // required: true,
      lowercase: true
    },

    nok_state: {
      type: Schema.Types.ObjectId,
      // required: true,
      ref: 'State'
    },

    nok_phone_number: {
      type: String,
      // required: true,
      trim: true
    },

    nok_relationship: {
      type: String,
      // required: true,
      enum: relationships
    },

    account_name: {
      type: String,
      lowercase: true,
      // required: true,
      trim: true
    },

    account_number: {
      type: String,
      // required: true,
      trim: true,
      unique: true,
      sparse: true
    },

    bank: {
      type: Schema.Types.ObjectId,
      // required: true,
      ref: 'Bank'
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

clientSchema.virtual('full_name').get(function () {
  return this.first_name.concat(
    this.middle_name ? ` ${this.middle_name}` : '',
    ` ${this.last_name}`
  )
})

clientSchema.virtual('age').get(function () {
  return computeAge(this.birth_date)
})

clientSchema.virtual('tenure').get(function () {
  return computeTenure(this.hire_date)
})

clientSchema.methods.getMonthNetPay = function (year, month) {
  return this.income[year][month]
}

/**
 * Validates the OTP sent to user email.
 * @param {string} otp
 * @returns {{ isValid: boolean, reason: (string|undefined) }}
 */
clientSchema.methods.validateOTP = function (otp) {
  if (Date.now() > this.otp.expiresIn) {
    return { isValid: false, reason: 'OTP expired' }
  }

  if (otp !== this.otp.pin) {
    return { isValid: false, reason: 'Invalid OTP' }
  }

  return { isValid: true }
}

clientSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

clientSchema.pre('save', function (next) {
  if (this.modifiedPaths()?.includes('password')) {
    this.password = bcrypt.hashSync(this.password, 10)
  }

  next()
})

clientSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('No client accounts found')
  }

  if (!doc) throw new NotFoundError('Client account not found')
})

const Origin = model('Client', clientSchema)

export default Origin

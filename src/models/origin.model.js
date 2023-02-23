import { Schema, model } from 'mongoose'

const schemaOptions = {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true }
}

const originSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },

    gender: {
      type: String,
      enum: ['Male', 'Female'],
      default: null
    },

    phone: {
      type: String,
      default: null
    },

    dateOfBirth: {
      type: Date,
      default: null
    },

    dateOfEnlistment: {
      type: Date,
      default: null
    },

    bvn: {
      type: String,
      unique: true,
      default: null
    },

    bvnValid: {
      type: Boolean,
      default: false
    },

    netPays: {
      type: [Number]
    },

    ippis: {
      type: String,
      trim: true,
      unique: true,
      required: true
    },

    segment: {
      type: String,
      trim: true,
      uppercase: true,
      default: null
    },

    command: {
      type: String,
      trim: true,
      default: null
    },

    accountNumber: {
      type: String,
      trim: true,
      default: null
    },

    bank: {
      type: String,
      trim: true,
      default: null
    }

  },
  schemaOptions
)

originSchema.virtual('age').get(function () {
  const dobMSec = this.dateOfBirth.getTime()
  const diff = Date.now() - dobMSec
  const age = new Date(diff).getUTCFullYear() - 1970

  return age
})

originSchema.virtual('length_of_service').get(function () {
  const doeMSec = this.dateOfEnlistment.getTime()
  const diff = Date.now() - doeMSec
  const serviceLength = new Date(diff).getUTCFullYear() - 1970

  return serviceLength
})

originSchema.methods.getMonthNetPay = function (idx = 6) {
  return this.netPays[idx]
}

const Origin = model('Origin', originSchema)

export default Origin

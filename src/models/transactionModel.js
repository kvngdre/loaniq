import { txnStatus } from '../utils/constants'
import { randomBytes } from 'crypto'
import { Schema, model } from 'mongoose'

const schemaOptions = { timestamps: true, versionKey: false }

const transactionSchema = new Schema(
  {
    lender: {
      type: Schema.Types.ObjectId,
      required: true
    },

    txnId: {
      type: String,
      default: null
    },

    gateway: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: Object.values(txnStatus),
      required: true
    },

    reference: {
      type: String,
      unique: true,
      default: () => randomBytes(4).toString('hex')
    },

    category: {
      type: String,
      enum: ['Debit', 'Credit'],
      required: true
    },

    desc: {
      type: String,
      default: null
    },

    channel: {
      type: String,
      default: null
    },

    bank: {
      type: String,
      default: null
    },

    cardType: {
      type: String,
      default: null
    },

    amount: {
      type: Number,
      required: true
    },

    currency: {
      type: String,
      default: 'NGN'
    },

    fee: {
      type: Number,
      default: null
    },

    balance: {
      type: Number,
      required: true,
      set: (v) => Math.floor(v * 100) / 100
    },

    balance_before: {
      type: Number,
      required: true,
      set: (v) => Math.floor(v * 100) / 100
    },

    balance_after: {
      type: Number,
      required: true,
      set: (v) => Math.floor(v * 100) / 100
    },

    paidAt: {
      type: Date,
      default: null
    },

    modifiedBy: {
      type: Schema.Types.ObjectId,
      default: null
    }
  },
  schemaOptions
)

const Transaction = model('Transaction', transactionSchema)

export default Transaction

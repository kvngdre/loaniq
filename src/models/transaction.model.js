import { txnPurposes, txnStatus, txnTypes } from '../utils/constants'
import { randomBytes } from 'crypto'
import { Schema, model } from 'mongoose'
import NotFoundError from '../errors/NotFoundError'

const schemaOptions = { timestamps: true, versionKey: false }

const transactionSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true
    },

    txn_id: {
      type: String,
      unique: true,
      default: () => randomBytes(4).toString('hex')
    },

    reference: {
      type: String,
      unique: true,
      required: true
    },

    status: {
      type: String,
      enum: Object.values(txnStatus),
      required: true
    },

    type: {
      type: String,
      enum: Object.values(txnTypes),
      required: true
    },

    purpose: {
      type: String,
      enum: Object.values(txnPurposes),
      required: true
    },

    description: {
      type: String,
      default: null
    },

    amount: {
      type: Number,
      required: true
    },

    channel: {
      type: String,
      default: null
    },

    currency: {
      type: String,
      default: 'NGN'
    },

    fees: {
      type: Number,
      default: null
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
    }
  },
  schemaOptions
)

transactionSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('Transactions not found.')
  }

  if (!doc) throw new NotFoundError('Transaction not found.')
})

const Transaction = model('Transaction', transactionSchema)

export default Transaction

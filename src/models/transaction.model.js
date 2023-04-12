import { txnPurposes, txnStatus, txnTypes } from '../utils/common.js'
import { randomBytes } from 'crypto'
import { Schema, model } from 'mongoose'
import NotFoundError from '../errors/NotFoundError.js'

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
      set: (v) => Math.floor(v * 100) / 100
    },

    balance_after: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100
    }
  },
  schemaOptions
)

transactionSchema.post(/^find/, function(doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('Transactions not found.')
  }

  if (!doc) throw new NotFoundError('Transaction not found.')
})

const Transaction = model('Transaction', transactionSchema)

export default Transaction

/**
 * Creates a transaction data transfer object.
 * @param {TransactionAdd} params
 * @returns {Object}
 */
export function TransactionDTO(params) {
  this.tenantId = params.tenantId
  this.reference = params.reference
  this.status = params.status
  this.type = params.type
  this.purpose = params.purpose
  this.amount = params.amount
  this.fees = params.fees
  this.description = params.desc
  this.channel = params.channel
  this.balance_before = params.balance
  this.balance_after =
    params.balance !== null
      ? params.type === txnTypes.DEBIT
        ? params.balance - params.amount
        : params.balance + params.amount
      : undefined
}

import { Schema, model } from 'mongoose'

const schemaOptions = { timestamps: true, versionKey: false }

const walletSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      unique: true,
      required: true
    },

    balance: {
      type: Number,
      default: 0,
      set: (v) => Math.floor(v * 100) / 100
    },

    last_credit_date: {
      type: Date,
      default: null
    }
  },
  schemaOptions
)

const Wallet = model('Wallet', walletSchema)

export default Wallet

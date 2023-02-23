import { Schema, model } from 'mongoose'

const schemaOptions = { strict: false, timestamps: true, versionKey: false }

const pendingSchema = new Schema(
  {
    lender: {
      type: String,
      required: true
    },

    docId: {
      type: Schema.Types.ObjectId,
      required: true
    },

    type: {
      type: String,
      enum: ['Customer', 'Loan'],
      required: true
    },

    status: {
      type: String,
      enum: ['Approved', 'Denied', 'Pending'],
      default: 'Pending'
    },

    remark: {
      type: String,
      trim: true,
      default: null
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      required: true
    },

    modifiedBy: {
      type: Schema.Types.ObjectId,
      required: true
    }
  },
  schemaOptions
)

const Pending = model('PendingEdit', pendingSchema)

export default Pending

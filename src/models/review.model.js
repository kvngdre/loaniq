import { Schema, model } from 'mongoose'
import NotFoundError from '../errors/NotFoundError'

const schemaOptions = { strict: false, timestamps: true, versionKey: false }

const reviewSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true
    },

    docId: {
      type: Schema.Types.ObjectId,
      required: true
    },

    type: {
      type: String,
      enum: ['customer', 'loan'],
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

    alteration: {
      type: Schema.Types.Mixed
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    modifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  schemaOptions
)

reviewSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('Reviews not found.')
  }

  if (!doc) throw new NotFoundError('Review not found.')
})

const Review = model('Review', reviewSchema)

export default Review

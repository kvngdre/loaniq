import { reviewStatus } from '../utils/common.js'
import { Schema, model } from 'mongoose'
import NotFoundError from '../errors/NotFoundError.js'

const schemaOptions = { timestamps: true, versionKey: false }

const reviewSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true
    },

    status: {
      type: String,
      enum: Object.values(reviewStatus),
      default: reviewStatus.PENDING
    },

    remark: {
      type: String,
      trim: true,
      default: null
    },

    type: {
      type: String,
      enum: ['Customer', 'Loan'],
      required: true
    },

    document: {
      type: Schema.Types.ObjectId,
      ref: (self = this) => self.type,
      required: true
    },

    alteration: {
      type: Schema.Types.Mixed,
      required: true
    },

    comment: {
      type: String,
      trim: true,
      default: null
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    modified_by: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  schemaOptions
)

reviewSchema.post(/^find/, async function (docs) {
  if (Array.isArray(docs)) {
    if (docs.length === 0) throw new NotFoundError('Reviews not found.')

    for (const doc of docs) {
      await doc.populate({
        path: 'document',
        select: (() => Object.keys(doc.alteration))()
      })
    }
  } else {
    if (!docs) throw new NotFoundError('Review not found.')

    await docs.populate([
      { path: 'document', select: (() => Object.keys(docs.alteration))() }
    ])
  }
})

const Review = model('Review', reviewSchema)

export default Review

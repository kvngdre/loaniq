import { Schema, model } from 'mongoose'
import NotFoundError from '../errors/NotFoundError.js'

const schemaOptions = { timestamps: true, versionKey: false }

const segmentSchema = new Schema(
  {
    code: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      required: true
    },

    id_prefix: {
      type: String,
      trim: true,
      default: null
    },

    name: {
      type: String,
      trim: true,
      required: true
    },

    active: {
      type: Boolean,
      default: true
    },

    recommendation: {
      max_age: {
        type: Number,
        default: 58
      },

      max_tenure: {
        type: Number,
        default: 33
      },

      min_income: {
        type: Number,
        set: (v) => Math.floor(v * 100) / 100,
        default: 30_000
      }
    }

    /**
     * todo have recommended values for this segments last 6 bvn and income data
     * todo authorize account number to be billed to send to customer account
     */
  },
  schemaOptions
)

segmentSchema.post(/^find/, function(doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('Segments not found.')
  }

  if (!doc) throw new NotFoundError('Segment not found.')
})

const Segment = model('Segment', segmentSchema)

export default Segment

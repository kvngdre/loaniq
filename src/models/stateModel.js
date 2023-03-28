import { geoZones } from '../utils/common'
import { Schema, model } from 'mongoose'
import NotFoundError from '../errors/NotFoundError'

const schemaOptions = { timestamps: true, versionKey: false }

const stateSchema = new Schema(
  {
    code: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      required: true
    },

    name: {
      type: String,
      trim: true,
      unique: true,
      required: true
    },

    lgas: {
      type: [String],
      required: true
    },

    geo: {
      type: String,
      enum: geoZones,
      required: true
    }
  },
  schemaOptions
)

stateSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('States not found.')
  }

  if (!doc) throw new NotFoundError('State not found.')
})

const State = model('State', stateSchema)

export default State

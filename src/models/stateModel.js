import { geoZones } from '../utils/constants'
import { Schema, model } from 'mongoose'

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

const State = model('State', stateSchema)

export default State

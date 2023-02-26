import { Schema, model } from 'mongoose'

const schemaOptions = { timestamps: true, versionKey: false }

const segmentSchema = new Schema({
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
  }

}, schemaOptions)

const Segment = model('Segment', segmentSchema)

export default Segment

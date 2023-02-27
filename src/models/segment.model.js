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

  /**
   * todo have recommended values for this segments last 6 bvn and income data
   * todo authorize account number to be billed to send to customer account
   */

}, schemaOptions)

const Segment = model('Segment', segmentSchema)

export default Segment

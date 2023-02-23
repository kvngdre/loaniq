import { Schema, model } from 'mongoose'

const schemaOptions = { timestamps: true, versionKey: false }

const bankSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      maxLength: 255,
      required: true
    },

    code: {
      type: String,
      minLength: 3,
      maxLength: 6,
      trim: true,
      unique: true,
      required: true
    }
  },
  schemaOptions
)

const Bank = model('Bank', bankSchema)

export default Bank

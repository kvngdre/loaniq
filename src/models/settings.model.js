import { Schema, model } from 'mongoose'

const schemaOptions = { timestamps: true, versionKey: false }

const settingsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      unique: true,
      required: true
    }
  },
  schemaOptions
)

const Settings = model('Setting', settingsSchema)

export default Settings

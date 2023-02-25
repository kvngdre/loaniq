import { Schema, model } from 'mongoose'

const schemaOptions = { timestamps: true, versionKey: false }

const settingsSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      unique: true,
      required: [true, 'Tenant Id is required.']
    },

    userId: {
      type: Schema.Types.ObjectId,
      unique: true,
      ref: 'User',
      required: [true, 'User Id is required.']
    },

    last_login_time: {
      type: Date,
      default: null
    },

    timezone: {
      type: String,
      default: 'Africa/Lagos'
    }
  },
  schemaOptions
)

const Setting = model('Setting', settingsSchema)

export default Setting

import { Schema, model } from 'mongoose'
import NotFoundError from '../errors/NotFoundError'

const schemaOptions = { timestamps: true, versionKey: false }

const userConfigSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
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

userConfigSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('User configurations not found.')
  }

  if (!doc) throw new NotFoundError('User configuration not found.')
})

const UserConfig = model('UserConfig', userConfigSchema)

export default UserConfig

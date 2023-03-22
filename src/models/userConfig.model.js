import { Schema, model } from 'mongoose'
import NotFoundError from '../errors/NotFoundError'

const schemaOptions = { timestamps: true, versionKey: false }

const configSchema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  last_login_time: {
    type: Date,
    default: null
  },

  timezone: {
    type: String,
    default: 'Africa/Lagos'
  },

  resetPwdDate: {
    type: Date,
    default: null
  },

  // todo, move the refresh tokens here
  sessions: {
    type: [
      {
        os: String,
        location: String,
        client: String,
        token: String,
        expiresIn: Number
      }
    ],
    default: null
  }

}, schemaOptions)

configSchema.post(/^find/, function (docs) {
  if (Array.isArray(docs) && docs.length === 0) {
    throw new NotFoundError('Users configurations not found.')
  }

  if (!docs) throw new NotFoundError('User configurations not found.')
})

const UserConfig = model('UserConfig', configSchema)

export default UserConfig

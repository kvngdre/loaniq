import { Schema, model } from 'mongoose'
import NotFoundError from '../errors/NotFoundError.js'

const schemaOptions = { timestamps: true, versionKey: false }

const permissionSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },

  description: String,

  type: {
    type: String,
    required: true
  },

  action: {
    type: String,
    // unique: true,
    required: true
  },

  target: {
    type: String
    // required: true
  }

  // possession: {
  //   type: String,
  //   enum: ['any', 'own'],
  //   default: 'own'
  // }
}, schemaOptions)

permissionSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('Permissions not found.')
  }

  if (!doc) throw new NotFoundError('Permission not found.')
})

const Permission = model('Permission', permissionSchema)

export default Permission

import { Schema, model } from 'mongoose';
import NotFoundError from '../errors/notFound.error.js';

const schemaOptions = { timestamps: true, versionKey: false };

const permissionSchema = new Schema(
  {
    name: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
    },

    description: String,

    type: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    target: {
      type: String,
      required: true,
    },

    level: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  schemaOptions,
);

permissionSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('Permissions not found.');
  }

  if (!doc) throw new NotFoundError('Permission not found.');
});

const Permission = model('Permission', permissionSchema);

export default Permission;

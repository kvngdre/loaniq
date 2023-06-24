import { Schema, model } from 'mongoose';
import NotFoundError from '../errors/NotFoundError.js';

const schemaOptions = { timestamps: true, versionKey: false };

const userConfigSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: true,
    },

    timezone: {
      type: String,
      default: 'Africa/Lagos',
    },

    resetPwdDate: {
      type: Date,
      default: null,
    },

    sessions: {
      type: [
        {
          os: String,
          location: String,
          client: String,
          ip: String,
          login_time: Date,
          token: String,
          expiresIn: Number,
        },
      ],
    },
  },
  schemaOptions,
);

userConfigSchema.post(/^find/, (docs) => {
  if (Array.isArray(docs) && docs.length === 0) {
    throw new NotFoundError('Users configurations not found.');
  }

  if (!docs) throw new NotFoundError('User configurations not found.');
});

const UserConfig = model('User_Config', userConfigSchema);

export default UserConfig;

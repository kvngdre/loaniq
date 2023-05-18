import { Schema, model } from 'mongoose';

const userConfigurationsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: true,
    },

    otp: {
      pin: {
        type: String,
        default: null,
      },

      expiresIn: {
        type: Number,
        default: null,
      },
    },

    resetPwd: {
      type: Boolean,
      default: true,
    },

    nextPasswordReset: {
      type: Number,
      default: null,
    },

    sessions: {
      type: [
        {
          os: String,
          client: String,
          ip: String,
          login_time: Date,
          token: String,
          expiresIn: Number,
        },
      ],
    },
  },
  { timestamps: true, versionKey: false },
);

const UserConfiguration = model('User-Configuration', userConfigurationsSchema);

export default UserConfiguration;

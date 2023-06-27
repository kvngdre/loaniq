import { Schema, model } from 'mongoose';

const tokensSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    token: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    expiration_time: {
      type: Number,
      required: true,
    },

    isUsed: Boolean,

    usedAt: Date,
  },
  { timestamps: true },
);

export const Token = model('Token', tokensSchema);

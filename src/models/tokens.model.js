import { Schema, model } from "mongoose";

const tokensSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    token: {
      type: String,
      index: true,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    expirationTime: {
      type: Number,
      required: true,
    },

    isUsed: {
      type: Boolean,
      default: false,
    },

    usedAt: Date,
  },
  { timestamps: true },
);

export const Token = model("Token", tokensSchema);

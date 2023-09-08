import { Schema, model } from "mongoose";

export const tokensSchema = new Schema(
  {
    userId: {
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

    expires: {
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

tokensSchema.index({ userId: 1, type: 1 }, { unique: true });

export const Token = model("Token", tokensSchema);

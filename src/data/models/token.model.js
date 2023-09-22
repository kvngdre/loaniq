import { Schema, model } from "mongoose";

import { TOKEN_TYPES } from "../../utils/helpers/token.helper.js";

export const tokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    value: {
      type: String,
      index: true,
      required: true,
    },

    type: {
      type: String,
      enum: Object.values(TOKEN_TYPES),
      required: true,
    },

    expires: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

tokenSchema.index({ userId: 1, type: 1 }, { unique: true });

export const Token = model("Token", tokenSchema);

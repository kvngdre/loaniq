import { Schema, model } from "mongoose";

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

tokenSchema.methods.validateToken = (token) => {
  if (Date.now() > this.expires) {
    return { isValid: false, reason: "Token Expired" };
  }

  if (token !== this.value) {
    return { isValid: false, reason: "Invalid Token" };
  }

  return { isValid: true };
};

export const Token = model("Token", tokenSchema);

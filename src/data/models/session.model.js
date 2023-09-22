import { Schema, model } from "mongoose";

export const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    sessions: {
      type: [
        {
          ip: { type: String, required: true },
          agent: { type: String, required: true },
          loginTime: { type: Date },
          refreshToken: { type: String, index: true, required: true },
          expiresIn: { type: Number, required: true },
        },
      ],
    },
  },
  { timestamps: true },
);

export const Session = model("Session", sessionSchema);

import { Schema, model } from "mongoose";

const sessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    sessions: {
      type: [
        {
          ip: String,
          loginTime: Date,
          token: String,
          expiresIn: Number,
        },
      ],
    },
  },
  { timestamps: true },
);

const Session = model("Session", sessionSchema);

export default Session;

import { Schema, model } from "mongoose";

export const roleSchema = new Schema(
  {
    isDefault: {
      type: Boolean,
      default: false,
    },

    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: String,

    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
  },
  { timestamps: true },
);

export const Role = model("Role", roleSchema);

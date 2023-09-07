import { Schema, model } from "mongoose";

const schemaOptions = { timestamps: true, versionKey: false };

const permissionSchema = new Schema(
  {
    name: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
    },

    description: String,

    type: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    target: {
      type: String,
      required: true,
    },

    level: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true },
);

const Permission = model("Permission", permissionSchema);

export default Permission;

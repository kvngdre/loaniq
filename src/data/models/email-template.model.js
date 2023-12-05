import { Schema, model } from "mongoose";

export const emailTemplateSchema = new Schema(
  {
    name: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
      unique: true,
      required: true,
    },

    description: {
      type: String,
      lowercase: true,
      trim: true,
      maxLength: 255,
      default: null,
    },

    type: {
      type: String,
    },

    subject: {
      type: String,
      required: true,
    },

    body: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const EmailTemplate = model("email_template", emailTemplateSchema);

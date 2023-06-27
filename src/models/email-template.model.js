import { Schema, model } from 'mongoose';
import { NotFoundError } from '../errors/index.js';

const schemaOptions = { timestamps: true, versionKey: false };

const emailTemplateSchema = new Schema(
  {
    name: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true,
    },

    templateName: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true,
    },

    type: {
      type: String,
    },

    subject: {
      type: String,
      required: true,
    },

    html: {
      type: String,
      required: true,
    },
  },
  schemaOptions,
);

emailTemplateSchema.post(/^find/, (doc) => {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('No templates not found.');
  }

  if (!doc) throw new NotFoundError('Template not found.');
});

const EmailTemplate = model('email_template', emailTemplateSchema);

export default EmailTemplate;

import { Schema, model } from 'mongoose';
import NotFoundError from '../errors/notFound.error.js';

const schemaOptions = { timestamps: true, versionKey: false };

const bankSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      maxLength: 255,
      required: true,
    },

    code: {
      type: String,
      minLength: 3,
      maxLength: 6,
      trim: true,
      unique: true,
      required: true,
    },
  },
  schemaOptions,
);

bankSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('Banks not found.');
  }

  if (!doc) throw new NotFoundError('Bank not found.');
});

const Bank = model('Bank', bankSchema);

export default Bank;

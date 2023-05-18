import { Schema, model } from 'mongoose';
import NotFoundError from '../errors/notFound.error.js';
import { GEO_ZONES } from '../utils/common.js';

const schemaOptions = { timestamps: true, versionKey: false };

const stateSchema = new Schema(
  {
    code: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      required: true,
    },

    name: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },

    lgas: {
      type: [String],
      required: true,
    },

    geo: {
      type: String,
      enum: GEO_ZONES,
      required: true,
    },
  },
  schemaOptions,
);

stateSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('States not found.');
  }

  if (!doc) throw new NotFoundError('State not found.');
});

const State = model('State', stateSchema);

export default State;

import { Schema, model } from 'mongoose';
import NotFoundError from '../errors/notFound.error.js';
import { GeoZone } from '../utils/constants.utils.js';

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
      enum: Object.values(GeoZone),
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

stateSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('States not found.');
  }

  if (!doc) throw new NotFoundError('State not found.');
});

const State = model('State', stateSchema);

export default State;

import { Schema, model } from 'mongoose';
import { geoZones } from '../utils/common.js';

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
      enum: geoZones,
      required: true,
    },
  },
  { timestamps: true },
);

const State = model('State', stateSchema);

export default State;

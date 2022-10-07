const { geoZones } = require('../utils/constants');
const mongoose = require('mongoose');

const schemaOptions = { timestamps: true, versionKey: false };

const stateSchema = new mongoose.Schema(
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
    schemaOptions
);

const State = mongoose.model('State', stateSchema);

module.exports = State;

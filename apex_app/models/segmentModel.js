const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },

    name: {
        type: String,
        required: true,
        trim: true,
    }
});

const Segment = mongoose.model('Segment', segmentSchema);

module.exports = Segment;
const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
    code: {
        type: String,
        uppercase: true,
        trim: true,
        unique: true,
        required: true
    },
    
    prefix: {
        type: String,
        trim: true
    },

    name: {
        type: String,
        trim: true,
        required: true
    }

});

const Segment = mongoose.model('Segment', segmentSchema);

module.exports = Segment;

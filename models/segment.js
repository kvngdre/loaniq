const mongoose = require('mongoose');


const schemaOptions = {timestamps: true};

const segmentSchema = new mongoose.Schema({
    code: {
        type: String,
        uppercase: true,
        trim: true,
        unique: true,
        required: true
    },
    
    ippisPrefix: {
        type: String,
        trim: true,
        required: true
    },

    name: {
        type: String,
        trim: true,
        required: true
    },

    active: {
        type: Boolean,
        default: true
    }

}, schemaOptions)

const Segment = mongoose.model('Segment', segmentSchema);

module.exports = Segment;
